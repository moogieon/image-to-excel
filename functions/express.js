import express from 'express';
import { handler as astroHandler } from '../dist/server/entry.mjs';

export async function createExpress() {
  const app = express();
  app.use(astroHandler);
  return app;
}
