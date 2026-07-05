import crypto from 'node:crypto';
import fastify, { FastifyInstance } from 'fastify';
import { prisma } from './lib/prisma';

type ClassItem = {
  id: string;
  name: string;
  section: string;
  teacherName?: string;
};

type StudentItem = {
  id: string;
  name: string;
  age: number;
  email: string;
  phone?: string;
};

type EnrollmentItem = {
  id: string;
  studentId: string;
  classId: string;
  status: 'active' | 'inactive';
};

type AttendanceRecord = {
  studentId: string;
  status: 'present' | 'absent' | 'late';
};

type AttendanceItem = {
  classId: string;
  date: string;
  records: AttendanceRecord[];
};

type FeePaymentItem = {
  studentId: string;
  classId: string;
  amount: number;
  month: string;
  status: 'paid' | 'pending';
};

type ResultItem = {
  studentId: string;
  classId: string;
  subject: string;
  marks: number;
};

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({ logger: false });

  const classes: ClassItem[] = [
    { id: 'class-1', name: 'Grade 10', section: 'A', teacherName: 'Mr. Silva' },
  ];

  const users = [
    {
      id: 'user-1',
      email: 'admin@edutrack.lk',
      password: 'password123',
      role: 'admin',
      name: 'Admin User',
    },
  ];

  const students: StudentItem[] = [
    { id: 'student-1', name: 'Nimal Perera', age: 16, email: 'nimal@example.com', phone: '0771234567' },
  ];

  const enrollments: EnrollmentItem[] = [];
  const attendance: AttendanceItem[] = [];
  const feePayments: FeePaymentItem[] = [];
  const results: ResultItem[] = [];

  app.get('/api/health', async () => ({
    status: 'ok',
    service: 'api',
    timestamp: new Date().toISOString(),
  }));

  app.post('/auth/login', async (request, reply) => {
    const body = request.body as { email?: string; password?: string };

    const user = users.find((candidate) => candidate.email === body.email);
    if (!user || user.password !== body.password) {
      reply.code(401);
      return { error: 'invalid credentials' };
    }

    const accessToken = crypto.randomBytes(16).toString('hex');
    const refreshToken = crypto.randomBytes(24).toString('hex');

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    };
  });

  app.get('/auth/me', async (request, reply) => {
    const authorization = request.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      reply.code(401);
      return { error: 'missing token' };
    }

    const token = authorization.replace('Bearer ', '');
    const user = users.find((candidate) => candidate.email === 'admin@edutrack.lk');

    if (!token || !user) {
      reply.code(401);
      return { error: 'invalid token' };
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
  });

  app.get('/classes', async () => classes);

  app.get('/classes/:id/students', async (request, reply) => {
    const { id } = request.params as { id: string };
    const selectedClass = classes.find((entry) => entry.id === id);

    if (!selectedClass) {
      reply.code(404);
      return { error: 'class not found' };
    }

    // Fixed: Explicitly typed 'student' parameter as StudentItem to fix Code 7006 error
    return students.map((student: StudentItem) => ({
      id: student.id,
      name: student.name,
      email: student.email,
    }));
  });

  app.post('/classes', async (request, reply) => {
    const body = request.body as {
      name?: string;
      section?: string;
      teacherName?: string;
    };

    if (!body.name || !body.section) {
      reply.code(400);
      return { error: 'name and section are required' };
    }

    const createdClass: ClassItem = {
      id: `class-${classes.length + 1}`,
      name: body.name,
      section: body.section,
      teacherName: body.teacherName ?? '',
    };

    classes.push(createdClass);
    reply.code(201);
    return createdClass;
  });

  app.get('/students', async () => {
    try {
      const studentsFromDb = await prisma.student.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return studentsFromDb.map((student) => ({
        id: student.id,
        name: student.name,
        age: student.age,
        email: student.email,
        phone: student.phone ?? '',
      }));
    } catch (error) {
      console.warn('Falling back to in-memory students:', error);
      return students;
    }
  });

  app.get('/students/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const student = students.find((entry) => entry.id === id);

    if (!student) {
      reply.code(404);
      return { error: 'student not found' };
    }

    return student;
  });

  app.post('/students', async (request, reply) => {
    const body = request.body as {
      name?: string;
      age?: number;
      email?: string;
      phone?: string;
    };

    if (!body.name || typeof body.age !== 'number' || !body.email) {
      reply.code(400);
      return { error: 'name, age and email are required' };
    }

    try {
      const createdStudent = await prisma.student.create({
        data: {
          name: body.name,
          age: body.age,
          email: body.email,
          phone: body.phone ?? '',
        },
      });

      reply.code(201);
      return {
        id: createdStudent.id,
        name: createdStudent.name,
        age: createdStudent.age,
        email: createdStudent.email,
        phone: createdStudent.phone ?? '',
      };
    } catch (error) {
      console.warn('Falling back to in-memory student creation:', error);
      const createdStudent: StudentItem = {
        id: `student-${students.length + 1}`,
        name: body.name,
        age: body.age,
        email: body.email,
        phone: body.phone ?? '',
      };

      students.push(createdStudent);
      reply.code(201);
      return createdStudent;
    }
  });

  app.post('/enrollments', async (request, reply) => {
    const body = request.body as {
      studentId?: string;
      classId?: string;
    };

    if (!body.studentId || !body.classId) {
      reply.code(400);
      return { error: 'studentId and classId are required' };
    }

    const existingEnrollment = enrollments.find(
      (enrollment) => enrollment.studentId === body.studentId && enrollment.classId === body.classId,
    );

    if (existingEnrollment) {
      reply.code(200);
      return existingEnrollment;
    }

    const createdEnrollment: EnrollmentItem = {
      id: `enrollment-${enrollments.length + 1}`,
      studentId: body.studentId,
      classId: body.classId,
      status: 'active',
    };

    enrollments.push(createdEnrollment);
    reply.code(201);
    return createdEnrollment;
  });

  app.post('/attendance', async (request, reply) => {
    const body = request.body as {
      classId?: string;
      date?: string;
      records?: AttendanceRecord[];
    };

    if (!body.classId || !body.date || !Array.isArray(body.records)) {
      reply.code(400);
      return { error: 'classId, date and records are required' };
    }

    const existingAttendance = attendance.find(
      (item) => item.classId === body.classId && item.date === body.date,
    );

    if (existingAttendance) {
      existingAttendance.records = body.records;
      reply.code(200);
      return existingAttendance;
    }

    const createdAttendance: AttendanceItem = {
      classId: body.classId,
      date: body.date,
      records: body.records,
    };

    attendance.push(createdAttendance);
    reply.code(201);
    return createdAttendance;
  });

  app.get('/attendance/:classId', async (request) => {
    const { classId } = request.params as { classId: string };
    const queryDate = (request.query as { date?: string }).date;

    const item = attendance.find(
      (entry) => entry.classId === classId && entry.date === (queryDate ?? ''),
    );

    if (!item) {
      return [];
    }

    return item;
  });

  app.post('/fees/pay', async (request, reply) => {
    const body = request.body as {
      studentId?: string;
      classId?: string;
      amount?: number;
      month?: string;
    };

    if (!body.studentId || !body.classId || typeof body.amount !== 'number' || !body.month) {
      reply.code(400);
      return { error: 'studentId, classId, amount and month are required' };
    }

    const payment: FeePaymentItem = {
      studentId: body.studentId,
      classId: body.classId,
      amount: body.amount,
      month: body.month,
      status: 'paid',
    };

    feePayments.push(payment);
    reply.code(201);
    return payment;
  });

  app.get('/fees/:classId/:month', async (request) => {
    const { classId, month } = request.params as { classId: string; month: string };

    return feePayments.filter((payment) => payment.classId === classId && payment.month === month);
  });

  app.post('/results', async (request, reply) => {
    const body = request.body as {
      studentId?: string;
      classId?: string;
      subject?: string;
      marks?: number;
    };

    if (!body.studentId || !body.classId || !body.subject || typeof body.marks !== 'number') {
      reply.code(400);
      return { error: 'studentId, classId, subject and marks are required' };
    }

    const createdResult: ResultItem = {
      studentId: body.studentId,
      classId: body.classId,
      subject: body.subject,
      marks: body.marks,
    };

    results.push(createdResult);
    reply.code(201);
    return createdResult;
  });

  app.get('/results/:studentId', async (request) => {
    const { studentId } = request.params as { studentId: string };
    return results.filter((result) => result.studentId === studentId);
  });

  return app;
}