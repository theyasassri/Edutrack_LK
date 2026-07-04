import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app';

describe('results endpoint', () => {
  it('stores exam results for a student', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/results',
      payload: {
        studentId: 'student-1',
        classId: 'class-1',
        subject: 'Mathematics',
        marks: 88,
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      studentId: 'student-1',
      classId: 'class-1',
      subject: 'Mathematics',
      marks: 88,
    });
  });
});
