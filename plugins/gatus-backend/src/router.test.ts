import { mockServices } from '@backstage/backend-test-utils';
import { HttpAuthService, LoggerService } from '@backstage/backend-plugin-api';
import express from 'express';
import fetch from 'cross-fetch';
import { createUptimeHandler } from './router';

jest.mock('cross-fetch', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const fetchMock = fetch as jest.MockedFunction<typeof fetch>;

const createRes = () => {
  const res = Object.create(express.response);
  res.statusCode = 200;
  res.body = undefined;
  res.status = jest.fn(function status(this: any, code: number) {
    this.statusCode = code;
    return this;
  });
  res.json = jest.fn(function json(this: any, payload: unknown) {
    this.body = payload;
    return this;
  });
  return res as express.Response & { body?: unknown };
};

describe('createUptimeHandler', () => {
  let catalog: { getEntityByRef: jest.Mock };
  let httpAuth: HttpAuthService;
  let logger: LoggerService;
  let handler: ReturnType<typeof createUptimeHandler>;

  beforeEach(() => {
    jest.resetAllMocks();
    catalog = {
      getEntityByRef: jest.fn(),
    };
    httpAuth = mockServices.httpAuth();
    logger = mockServices.logger.mock() as unknown as LoggerService;
    handler = createUptimeHandler({
      catalog,
      httpAuth,
      logger,
    });
  });

  it('returns data from Gatus when annotation exists', async () => {
    catalog.getEntityByRef.mockResolvedValue({
      kind: 'Component',
      metadata: {
        namespace: 'default',
        name: 'storefront',
        annotations: {
          'twin.sh/gatus-url':
            'https://status.example.com/api/v1/endpoints/foo/statuses',
        },
      },
    });
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ name: 'foo', results: [] }),
    } as any);

    const req = {
      params: { kind: 'component', namespace: 'default', name: 'storefront' },
      headers: {},
    } as unknown as express.Request;
    const res = createRes();

    await handler(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.body).toEqual({
      entityRef: 'component:default/storefront',
      endpoint: 'https://status.example.com/api/v1/endpoints/foo/statuses',
      name: 'foo',
      results: [],
    });
  });

  it('returns error when annotation missing', async () => {
    catalog.getEntityByRef.mockResolvedValue({
      kind: 'Component',
      metadata: {
        namespace: 'default',
        name: 'storefront',
      },
    });

    const req = {
      params: { kind: 'component', namespace: 'default', name: 'storefront' },
      headers: {},
    } as unknown as express.Request;
    const res = createRes();

    await expect(handler(req, res)).rejects.toThrow(/twin\.sh\/gatus-url/);
  });
});
