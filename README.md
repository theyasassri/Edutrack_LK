# EduTrack LK

## Local development setup

### Prerequisites
- Node.js 20+
- npm
- Docker Desktop running
- Git

### 1. Clone the repository
```powershell
cd C:\newproject\Project_Tenura
git clone https://github.com/theyasassri/Edutrack_LK.git
cd Edutrack_LK
```

### 2. Install dependencies
```powershell
npm install
```

### 3. Create the root environment file
Create `C:\newproject\Project_Tenura\Edutrack_LK\.env` with these values:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/edutrack?schema=public
REDIS_URL=redis://localhost:6379
JWT_SECRET=edutrack-dev-secret
PORT=4000
```

### 4. Start Docker services
```powershell
docker compose up -d postgres redis
```

If you see a warning about `version` in `docker-compose.yml`, you can ignore it.

### 5. Generate Prisma client
```powershell
npx prisma generate --schema packages/database/prisma/schema.prisma --config packages/database/prisma.config.ts
```

### 6. Apply database migrations
```powershell
npx prisma migrate dev --schema packages/database/prisma/schema.prisma --config packages/database/prisma.config.ts --name init
```

### 7. Start the backend
```powershell
npm --prefix apps/api run dev
```

### 8. Run backend tests
```powershell
npm --prefix apps/api run test
```

## Daily workflow

### Start working
1. Ensure Docker Desktop is running.
2. Start services if needed:
```powershell
docker compose up -d postgres redis
```
3. Start backend:
```powershell
npm --prefix apps/api run dev
```

### Stop Docker when done
- Stop containers and keep data:
```powershell
docker compose stop
```
- Stop and remove containers/network:
```powershell
docker compose down
```

## What your frontend teammate should do before starting
- Review the backend route endpoints in `apps/api/src/app.ts`
- Prepare a frontend `.env` if needed, for example:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```
- Start the frontend with its package commands when ready

## Useful commands summary

| Purpose | Command |
|---|---|
| Start Docker services | `docker compose up -d postgres redis` |
| Stop containers | `docker compose stop` |
| Remove containers and network | `docker compose down` |
| Generate Prisma client | `npx prisma generate --schema packages/database/prisma/schema.prisma --config packages/database/prisma.config.ts` |
| Apply migrations | `npx prisma migrate dev --schema packages/database/prisma/schema.prisma --config packages/database/prisma.config.ts --name init` |
| Start backend | `npm --prefix apps/api run dev` |
| Run backend tests | `npm --prefix apps/api run test` |

## Frontend developer checklist

If you are building the UI, use `apps/web` and `packages/ui`.

### Quick start
- Ensure the backend is running at `http://localhost:4000`
- Copy `apps/web/.env.example` to `apps/web/.env` if it exists
- Set `NEXT_PUBLIC_API_URL=http://localhost:4000`
- Start the frontend with:
```powershell
npm --prefix apps/web run dev
```

### What to use
- `apps/web` — Next.js frontend app
- `packages/ui` — shared components
- `packages/types` — shared TypeScript types

### API integration
- Review available routes in `apps/api/src/app.ts`
- Use `NEXT_PUBLIC_API_URL=http://localhost:4000`
- Keep auth tokens in client headers as needed

## Notes
- The root `.env` file is the required file for the current setup.
- If you develop from another folder, be careful to run Prisma commands from the repository root or include `--config packages/database/prisma.config.ts`.
- The backend currently uses PostgreSQL in Docker and Prisma for database access.
