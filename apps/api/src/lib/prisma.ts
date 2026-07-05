import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Force load the environment variables from the workspace root
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is missing.');
}

// Create a connection pool using the native pg driver
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Wrap the pool with Prisma's driver adapter
const adapter = new PrismaPg(pool);

// Instantiate the client with the adapter
export const prisma = new PrismaClient({ adapter });