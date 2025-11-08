import {
  HttpAuthService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { stringifyEntityRef } from '@backstage/catalog-model';
import {
  ForwardedError,
  InputError,
  NotFoundError,
} from '@backstage/errors';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import express from 'express';
import Router from 'express-promise-router';
import fetch from 'cross-fetch';

const GATUS_URL_ANNOTATION = 'twin.sh/gatus-url';

type RouterOptions = {
  httpAuth: HttpAuthService;
  catalog: Pick<typeof catalogServiceRef.T, 'getEntityByRef'>;
  logger: LoggerService;
};

const normalizeKind = (rawKind?: string): string => {
  if (!rawKind) {
    return 'Component';
  }
  const normalized = rawKind.trim().toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export const createUptimeHandler =
  ({ httpAuth, catalog, logger }: RouterOptions) =>
  async (req: express.Request, res: express.Response) => {
    const namespace = decodeURIComponent(req.params.namespace ?? 'default');
    const name = decodeURIComponent(req.params.name);
    const kind = normalizeKind(req.params.kind);

    if (!name) {
      throw new InputError('Component name is required');
    }

    const entityRef = {
      kind,
      namespace: namespace || 'default',
      name,
    };

    const entity = await catalog.getEntityByRef(entityRef, {
      credentials: await httpAuth.credentials(req, {
        allow: ['service', 'user'],
      }),
    });

    if (!entity) {
      throw new NotFoundError(
        `No component found for ref '${stringifyEntityRef(entityRef)}'`,
      );
    }

    const gatusUrl = entity.metadata.annotations?.[GATUS_URL_ANNOTATION];

    if (!gatusUrl) {
      throw new InputError(
        `Entity ${stringifyEntityRef(
          entityRef,
        )} is missing the ${GATUS_URL_ANNOTATION} annotation`,
      );
    }

    let response;
    try {
      response = await fetch(gatusUrl);
    } catch (error) {
      logger.error('Failed to reach Gatus endpoint', {
        entityRef: stringifyEntityRef(entityRef),
        gatusUrl,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ForwardedError(
        `Unable to reach the configured Gatus endpoint (${gatusUrl})`,
        error,
      );
    }

    if (!response.ok) {
      const body = await response.text().catch(() => undefined);
      logger.warn('Gatus request failed', {
        entityRef: stringifyEntityRef(entityRef),
        gatusUrl,
        status: response.status,
        statusText: response.statusText,
        body,
      });
      res.status(502).json({
        error: `Gatus responded with ${response.status} ${response.statusText}`,
        body,
      });
      return;
    }

    const payload = await response.json();

    res.json({
      entityRef: stringifyEntityRef(entityRef),
      endpoint: gatusUrl,
      ...payload,
    });
  };

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  const handler = createUptimeHandler(options);
  router.get('/uptime/:kind/:namespace/:name', handler);

  router.get('/uptime/:namespace/:name', (req, res) => {
    (req.params as Record<string, string>).kind = 'Component';
    return handler(req as express.Request, res);
  });

  return router;
}
