import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/server.js';

let server;
let BASE;

// Spin up a fresh server on a random available port so tests never
// collide with each other or a running dev instance.
before(() => new Promise((resolve) => {
  server = createApp().listen(0, () => {
    BASE = `http://localhost:${server.address().port}`;
    resolve();
  });
}));

after(() => new Promise((resolve) => server.close(resolve)));

test('GET / returns Hello World', async () => {
  const res = await fetch(`${BASE}/`);
  assert.equal(res.status, 200);
  const { message } = await res.json();
  assert.equal(message, 'Hello, World!');
});

test('GET /healthz returns ok', async () => {
  const res = await fetch(`${BASE}/healthz`);
  assert.equal(res.status, 200);
  const { status } = await res.json();
  assert.equal(status, 'ok');
});

test('GET /readyz returns ready', async () => {
  const res = await fetch(`${BASE}/readyz`);
  assert.equal(res.status, 200);
  const { status } = await res.json();
  assert.equal(status, 'ready');
});

test('unknown route returns 404', async () => {
  const res = await fetch(`${BASE}/nope`);
  assert.equal(res.status, 404);
});
