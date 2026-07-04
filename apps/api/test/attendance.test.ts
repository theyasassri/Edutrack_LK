import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app';

describe('attendance endpoint', () => {
  it('creates attendance records for a date', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/attendance',
      payload: {
        classId: 'class-1',
        date: '2026-07-05',
        records: [
          { studentId: 'student-1', status: 'present' },
        ],
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      classId: 'class-1',
      date: '2026-07-05',
      records: [
        { studentId: 'student-1', status: 'present' },
      ],
    });
  });
});
