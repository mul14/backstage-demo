import {
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const gatusPlugin = createPlugin({
  id: 'gatus',
  routes: {
    root: rootRouteRef,
  },
});

export const GatusPage = gatusPlugin.provide(
  createRoutableExtension({
    name: 'GatusPage',
    component: () =>
      import('./components/StandalonePage/StandalonePage').then(
        m => m.StandalonePage,
      ),
    mountPoint: rootRouteRef,
  }),
);

export const EntityGatusContent = gatusPlugin.provide(
  createComponentExtension({
    name: 'EntityGatusContent',
    component: {
      lazy: () =>
        import('./components/EntityContent/EntityGatusContent').then(
          m => m.EntityGatusContent,
        ),
    },
  }),
);
