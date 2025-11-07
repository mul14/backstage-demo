import {
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
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
