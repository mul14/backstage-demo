import { createDevApp } from '@backstage/dev-utils';
import { gatusPlugin, GatusPage } from '../src/plugin';

createDevApp()
  .registerPlugin(gatusPlugin)
  .addPage({
    element: <GatusPage />,
    title: 'Root Page',
    path: '/gatus',
  })
  .render();
