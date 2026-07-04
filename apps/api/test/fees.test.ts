import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app';

describe('fees endpoint', () => {
  it('records a payment and returns fee status', async () => {
    const app = await buildApp();

    const paymentResponse = await app.inject({
      method: 'POST',
      url: '/fees/pay',
      payload: {
        studentId: 'student-1',
        classId: 'class-1',
        amount: 2500,
        month: '2026-07',
      },
    });

    expect(paymentResponse.statusCode).toBe(201);
    expect(paymentResponse.json()).toEqual({
      studentId: 'student-1',
      classId: 'class-1',
      amount: 2500,
      month: '2026-07',
      status: 'paid',
    });
  });
});
