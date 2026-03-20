import { onRequest } from 'firebase-functions/v2/https';
import { createExpress } from './express.js';

let app;

export const ssr = onRequest(
  { region: 'asia-northeast3', memory: '512MiB' },
  async (req, res) => {
    if (!app) {
      app = await createExpress();
    }
    app(req, res);
  }
);
