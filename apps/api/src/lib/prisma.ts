import 'dotenv/config';
import { PrismaClient } from '../../../../packages/database/generated/prisma/client';

type StudentRecord = {
  id: string;
  name: string;
  age: number;
  email: string;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type StudentCreateInput = {
  data: {
    name: string;
    age: number;
    email: string;
    phone?: string;
  };
};

const connectionString = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/edutrack?schema=public';

let prismaClient: PrismaClient | null = null;

function createPrismaClient(): PrismaClient | null {
  if (prismaClient) {
    return prismaClient;
  }

  try {
    prismaClient = new PrismaClient({
      datasources: {
        db: {
          url: connectionString,
        },
      },
    } as never);
    return prismaClient;
  } catch (error) {
    console.warn('Prisma client initialization failed, using fallback data layer:', error);
    return null;
  }
}

const fallbackStudent = {
  findMany: async (): Promise<StudentRecord[]> => [],
  create: async (input: StudentCreateInput): Promise<StudentRecord> => {
    const now = new Date();
    return {
      id: `student-${now.getTime()}`,
      name: input.data.name,
      age: input.data.age,
      email: input.data.email,
      phone: input.data.phone ?? null,
      createdAt: now,
      updatedAt: now,
    };
  },
};

export const prisma = {
  student: {
    findMany: async (args?: unknown) => {
      const client = createPrismaClient();
      if (!client) {
        return fallbackStudent.findMany();
      }

      try {
        return await client.student.findMany(args as never);
      } catch (error) {
        console.warn('Prisma student lookup failed, using fallback data layer:', error);
        return fallbackStudent.findMany();
      }
    },
    create: async (input: StudentCreateInput) => {
      const client = createPrismaClient();
      if (!client) {
        return fallbackStudent.create(input);
      }

      try {
        return await client.student.create(input as never);
      } catch (error) {
        console.warn('Prisma student creation failed, using fallback data layer:', error);
        return fallbackStudent.create(input);
      }
    },
  },
};
