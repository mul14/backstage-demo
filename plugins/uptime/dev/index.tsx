import { createDevApp } from '@backstage/dev-utils';
import { uptimePlugin } from '../src/plugin';
import { UptimeStatusCard } from '../src/components/UptimeStatusCard/UptimeStatusCard';

createDevApp()
  .registerPlugin(uptimePlugin)
  .addPage({
    element: <UptimeStatusCard />,
    title: 'Uptime Demo',
    path: '/uptime',
  })
  .render();
