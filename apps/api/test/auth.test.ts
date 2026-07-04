import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app';

describe('auth endpoints', () => {
  it('issues a jwt token for valid credentials', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'admin@edutrack.lk',
        password: 'password123',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      user: {
        email: 'admin@edutrack.lk',
        role: 'admin',
      },
    });
  });

  it('returns current user for a valid token', async () => {
    const app = await buildApp();

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'admin@edutrack.lk',
        password: 'password123',
      },
    });

    const { accessToken } = loginResponse.json() as { accessToken: string };

    const response = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      email: 'admin@edutrack.lk',
      role: 'admin',
    });
  });
});
