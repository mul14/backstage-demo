import { coreServices, createBackendPlugin } from '@backstage/backend-plugin-api';
import Router from 'express-promise-router';
import express from 'express';
import fetch from 'cross-fetch';

const createRouter = () => {
  const router = Router();
  router.use(express.json());

  router.post('/check', async (req, res) => {
    const url: unknown = req.body?.url;

    if (typeof url !== 'string' || url.trim() === '') {
      res.status(400).json({ ok: false, error: 'url is required' });
      return;
    }

    try {
      const response = await fetch(url, { redirect: 'follow' });
      res.json({ ok: response.ok, status: response.status, statusText: response.statusText });
    } catch (error) {
      res.json({ ok: false, error: error instanceof Error ? error.message : String(error) });
    }
  });

  return router;
};

export const uptimeBackendPlugin = createBackendPlugin({
  pluginId: 'uptime',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
      },
      async init({ httpRouter }) {
        httpRouter.use(createRouter());
      },
    });
  },
});

export default uptimeBackendPlugin;
