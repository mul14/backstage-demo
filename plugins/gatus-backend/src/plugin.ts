import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import { createRouter } from './router';

/**
 * gatusPlugin backend plugin
 *
 * @public
 */
export const gatusPlugin = createBackendPlugin({
  pluginId: 'gatus',
  register(env) {
    env.registerInit({
      deps: {
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        catalog: catalogServiceRef,
        logger: coreServices.logger,
      },
      async init({ httpAuth, httpRouter, catalog, logger }) {
        httpRouter.use(
          await createRouter({
            httpAuth,
            catalog,
            logger,
          }),
        );
      },
    });
  },
});
