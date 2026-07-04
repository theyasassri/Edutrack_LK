import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app';

describe('health endpoint', () => {
  it('returns a healthy response', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: 'ok',
      service: 'api',
      timestamp: expect.any(String),
    });
  });
});
