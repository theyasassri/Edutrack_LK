import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app';

describe('enrollment endpoint', () => {
  it('creates an enrollment for a student in a class', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/enrollments',
      payload: {
        studentId: 'student-1',
        classId: 'class-1',
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      id: 'enrollment-1',
      studentId: 'student-1',
      classId: 'class-1',
      status: 'active',
    });
  });
});
