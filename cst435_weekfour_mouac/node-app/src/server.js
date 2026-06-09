import express from 'express';

const PORT = parseInt(process.env.PORT ?? '3000', 10);

function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json());

  app.get('/',       (_req, res) => res.json({ message: 'Hello, World!' }));
  app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));
  app.get('/readyz',  (_req, res) => res.json({ status: 'ready' }));

  return app;
}

export { createApp };

// Guard prevents the server from starting when this file is imported in tests.
if (process.argv[1] === new URL(import.meta.url).pathname) {
  createApp().listen(PORT, () => console.log(`Listening on :${PORT}`));
}
