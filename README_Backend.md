# EduTrack LK — Backend & Infrastructure
### Your Role: Collaborator A (Backend / AI / DevOps)

---

## Your Ownership

You own everything that runs **on the server and in the database.**
Your teammate handles the browser UI — you give them working APIs to call.

```
edutrack-lk/
├── apps/
│   ├── api/          ✅ YOURS — Fastify backend, all API routes
│   └── worker/       ✅ YOURS — WhatsApp sender, email, cron jobs
└── packages/
    ├── database/     ✅ YOURS — Prisma schema, migrations, seed
    └── types/        ✅ YOURS — shared TypeScript interfaces (both use this)
```

> `apps/web` and `packages/ui` belong to your teammate. Don't touch those.

---

## Tech Stack (Your Side)

| Layer | Tool |
|---|---|
| Backend Framework | Fastify 4.x (Node.js) |
| ORM | Prisma 5.x |
| Database | PostgreSQL 16 |
| Queue / Cache | Redis + BullMQ |
| WhatsApp | Baileys (wa-web.js) |
| Auth | JWT + Phone OTP (Twilio) |
| Email | Resend |
| Testing | Vitest |
| Deployment | DigitalOcean VPS + GitHub Actions |

---

## Local Dev Setup

### Prerequisites
- Node.js 20+ (`nvm use 20`)
- Docker Desktop (for PostgreSQL + Redis)
- Git 2.40+

### First-Time Setup

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/edutrack-lk.git
cd edutrack-lk

# 2. Install all dependencies
npm install

# 3. Copy env file
cp .env.example .env
# Fill in your local values (DB, Redis, Twilio, etc.)

# 4. Start PostgreSQL + Redis via Docker
docker-compose up -d

# 5. Run DB migrations and seed
cd packages/database
npx prisma migrate dev
npx prisma db seed
cd ../..

# 6. Start only your services
npx turbo dev --filter=api --filter=worker
# API runs at: http://localhost:4000
```

### Useful Commands

| Command | What It Does |
|---|---|
| `npx turbo dev --filter=api` | Start only the API server |
| `npx turbo test --filter=api` | Run API unit tests |
| `npx prisma studio` | Open DB GUI in browser |
| `npx prisma migrate dev` | Create + apply a new migration |
| `npx prisma migrate reset` | Wipe DB and re-seed (dev only) |
| `docker-compose logs -f` | Tail Docker logs |

---

## Your Tasks by Phase

### Phase 1 — Foundation (Week 1–2)
- [ ] Initialize Turborepo monorepo structure
- [ ] Configure TypeScript strict mode across all packages
- [ ] Set up Docker Compose (PostgreSQL + Redis + pgAdmin)
- [ ] Scaffold Fastify API with `/api/health` endpoint
- [ ] Configure ESLint + Prettier + Husky pre-commit hooks
- [ ] Set up GitHub Actions: lint → test → build on every PR
- [ ] Write `.env.example` with all required environment variables
- [ ] Write Prisma schema (User, Class, Student, Enrollment)
- [ ] Run first migration: `npx prisma migrate dev --name init`

### Phase 2 — Auth & Core Models (Week 3–4)
- [ ] Implement JWT auth in Fastify (login, refresh, logout)
- [ ] Add phone OTP via Twilio
- [ ] Add auth middleware: route guards by role
- [ ] Implement Class CRUD API
- [ ] Implement Student CRUD API
- [ ] Build Enrollment logic (student → multiple classes)

### Phase 3 — Attendance API (Week 5–7)
- [ ] Complete Attendance schema + status enum
- [ ] `POST /attendance` — bulk mark for a date
- [ ] `GET /attendance/:classId?date=YYYY-MM-DD`
- [ ] Attendance summary API (monthly report per student)
- [ ] Unit test attendance service (Vitest)

### Phase 4 — Fee Management API (Week 8–10)
- [ ] Add Payment + FeeConfig schema to Prisma
- [ ] Fee configuration per class (monthly amount, due day)
- [ ] `POST /fees/pay` — record a payment
- [ ] `GET /fees/:classId/month/:month` — fee status list
- [ ] Overdue detection logic (cron job via BullMQ)

### Phase 5 — WhatsApp Worker (Week 11–13)
- [ ] Set up `apps/worker` with BullMQ processors
- [ ] Integrate Baileys library
- [ ] WhatsApp QR connect flow + session persistence in Redis
- [ ] Attendance notification job (fires after attendance marked)
- [ ] Fee reminder job (monthly cron, 28th of month)
- [ ] Overdue alert job (3 days, 7 days after due date)
- [ ] Retry logic (3 retries, exponential backoff)

### Phase 6 — Analytics & Deployment (Week 14–17)
- [ ] `POST /results` — bulk upload exam marks
- [ ] `GET /analytics/class/:id` and `/analytics/student/:id`
- [ ] Billing/subscription logic (Pro plan paywall)
- [ ] Integrate PayHere payment gateway
- [ ] Set up production on DigitalOcean
- [ ] Configure Cloudflare DNS + SSL
- [ ] GitHub Actions deploy workflow via SSH

### Phase 7 — Beta (Week 18–20)
- [ ] Set up Sentry error monitoring
- [ ] Set up PostHog analytics
- [ ] Weekly releases, bug fixes

---

## API Endpoints Reference (What You Build)

| Service | Method | Endpoint |
|---|---|---|
| Auth | POST | `/auth/login` `/auth/refresh` |
| Class | GET/POST | `/classes` `/classes/:id/students` |
| Student | GET/POST | `/students` `/students/:id` |
| Attendance | POST/GET | `/attendance` `/attendance/:classId/:date` |
| Fee | GET/POST | `/fees/:studentId` `/fees/pay` |
| Notify | POST | `/notify/whatsapp` `/notify/email` |
| Analytics | GET | `/analytics/class/:id` `/analytics/student/:id` |

Share the responses from these with your teammate so they can build the UI against them.

---

## Branching Rules

- Your branches: `feat/api-*`, `feat/worker-*`, `feat/db-*`
- Examples: `feat/api-attendance`, `feat/worker-whatsapp`, `feat/db-schema-v2`
- Always branch from `main`, open a PR, pass CI before merging
- Commit format: `feat(api): add attendance bulk mark endpoint`

---

## Secrets You Manage

```
DATABASE_URL
REDIS_URL
JWT_SECRET
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
RESEND_API_KEY
VPS_HOST
VPS_SSH_KEY
S3_ACCESS_KEY
S3_SECRET_KEY
```

Store these in GitHub Secrets (Settings → Secrets → Actions) and your local `.env`.

---

## Resources

- Fastify Docs: https://fastify.dev/docs
- Prisma Docs: https://www.prisma.io/docs
- BullMQ Docs: https://docs.bullmq.io
- Baileys (WhatsApp): https://github.com/WhiskeySockets/Baileys
- PayHere Sri Lanka: https://www.payhere.lk/developers
- Turborepo Docs: https://turbo.build/repo/docs
