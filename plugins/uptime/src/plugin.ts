import {
  createComponentExtension,
  createPlugin,
} from '@backstage/core-plugin-api';

export const uptimePlugin = createPlugin({
  id: 'uptime',
  routes: {},
});

export const EntityUptimeStatusCard = uptimePlugin.provide(
  createComponentExtension({
    name: 'EntityUptimeStatusCard',
    component: {
      lazy: () =>
        import('./components/UptimeStatusCard/UptimeStatusCard').then(
          m => m.UptimeStatusCard,
        ),
    },
  }),
);
