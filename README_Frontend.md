# EduTrack LK — Frontend & UI
### Your Role: Collaborator B (Frontend / JavaScript)

---

## Your Ownership

You own everything the **teacher and parent sees in the browser.**
Your teammate builds the APIs — you call them and build the UI on top.

```
edutrack-lk/
├── apps/
│   └── web/          ✅ YOURS — Next.js PWA, all pages and screens
└── packages/
    ├── ui/           ✅ YOURS — shared React components
    └── types/        ✅ SHARED — TypeScript interfaces (coordinate with teammate)
```

> `apps/api` and `apps/worker` and `packages/database` belong to your teammate. Don't touch those.

---

## Tech Stack (Your Side)

| Layer | Tool |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Server State | TanStack Query (React Query) v5 |
| Client State | Zustand |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Offline Storage | Dexie.js (IndexedDB) |
| PWA | next-pwa / Workbox |
| Testing | Playwright (E2E) |

---

## Local Dev Setup

### Prerequisites
- Node.js 20+ (`nvm use 20`)
- Git 2.40+
- VS Code with: ESLint, Prettier, Tailwind IntelliSense extensions

### First-Time Setup

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/edutrack-lk.git
cd edutrack-lk

# 2. Install all dependencies
npm install

# 3. Copy env file
cp .env.example .env
# You only need to set:
# NEXT_PUBLIC_API_URL=http://localhost:4000

# 4. Start only your app
npx turbo dev --filter=web
# Runs at: http://localhost:3000
```

> Note: You need your teammate's API running at port 4000 to test real data.
> Ask them to share a local API or use mock data during early development.

### Useful Commands

| Command | What It Does |
|---|---|
| `npx turbo dev --filter=web` | Start only the Next.js app |
| `npx turbo build --filter=web` | Build for production |
| `npx turbo lint --filter=web` | Run ESLint |
| `npx playwright test` | Run E2E tests |

---

## Pages You Build

| Page | Route | Description |
|---|---|---|
| Login | `/login` | Phone + OTP login screen |
| Dashboard | `/dashboard` | Class cards, quick stats overview |
| Class Detail | `/classes/[id]` | Student list for a class |
| Attendance | `/classes/[id]/attendance` | One-tap mark attendance per student |
| Fee Dashboard | `/classes/[id]/fees` | Green/red/orange payment status per student |
| Fee History | `/students/[id]/fees` | Payment history for one student |
| Results Entry | `/classes/[id]/results` | Spreadsheet-style marks entry grid |
| Student Profile | `/students/[id]` | Full student info, charts, history |
| Performance Chart | `/students/[id]/performance` | Recharts line chart over time |
| Notifications | `/settings/notifications` | Toggle WhatsApp/email notification types |
| Template Editor | `/settings/templates` | Customize WhatsApp message templates |
| Notification Log | `/settings/notifications/log` | Sent/failed message history |
| Parent Portal | `/parent/[token]` | Read-only view via magic link |
| Onboarding Wizard | `/onboarding` | Guided setup for new teachers |

---

## Your Tasks by Phase

### Phase 1 — Foundation (Week 1–2)
- [ ] Scaffold Next.js app inside `apps/web` with Tailwind + shadcn/ui
- [ ] Set up folder structure: `app/`, `components/`, `hooks/`, `lib/`
- [ ] Configure TanStack Query provider at root layout
- [ ] Configure Zustand store (current class, user session)

### Phase 2 — Auth & Core UI (Week 3–4)
- [ ] Build login page: phone input → OTP verification flow
- [ ] Build teacher registration/onboarding screens
- [ ] Build dashboard page: class cards, quick stats
- [ ] Build class detail page: student list, basic info
- [ ] Build student add/edit form with guardian details

### Phase 3 — Attendance UI (Week 5–7)
- [ ] Build attendance page: date picker + student checklist (one tap per student)
- [ ] Build attendance history view: calendar heatmap per student
- [ ] Build monthly attendance summary: % per student
- [ ] Implement PWA service worker (next-pwa or Workbox)
- [ ] Implement offline attendance queue with Dexie.js
- [ ] Build sync mechanism: push offline records when back online

### Phase 4 — Fee UI (Week 8–10)
- [ ] Build fee dashboard: colour-coded status per student (green/red/orange)
- [ ] Build payment recording modal: amount, date, method (cash/bank)
- [ ] Build monthly fee report: table view
- [ ] Build payment history view per student
- [ ] Build fee reminder trigger button (manual send per student or bulk)

### Phase 5 — Notification Settings UI (Week 11–13)
- [ ] Build WhatsApp QR connect screen (scan once to link teacher's number)
- [ ] Build notification settings page: toggles per notification type
- [ ] Build WhatsApp template editor (editable text with placeholders shown)
- [ ] Build notification log page: table of sent/failed messages

### Phase 6 — Analytics, Parent Portal & Polish (Week 14–17)
- [ ] Build results entry UI: spreadsheet-style grid (class × students)
- [ ] Build student performance chart (Recharts line chart over time)
- [ ] Build class analytics page: average score, top/low performers
- [ ] Build parent portal (read-only, magic link access)
- [ ] Mobile responsiveness audit: fix all breakpoints
- [ ] Run Lighthouse audit: target score > 85 on mobile
- [ ] Write E2E tests with Playwright for all critical flows

### Phase 7 — Beta (Week 18–20)
- [ ] Link Tally.so feedback form inside the app
- [ ] Instrument PostHog: page views, feature usage, funnels
- [ ] Fix bugs reported by beta teachers
- [ ] Record YouTube demo video walkthrough

---

## Calling the API (How to Connect to Backend)

Your teammate's API runs at `http://localhost:4000`. Use TanStack Query for all data fetching.

Example pattern:

```typescript
// hooks/useAttendance.ts
import { useQuery, useMutation } from '@tanstack/react-query'

const API = process.env.NEXT_PUBLIC_API_URL

export function useAttendance(classId: string, date: string) {
  return useQuery({
    queryKey: ['attendance', classId, date],
    queryFn: async () => {
      const res = await fetch(`${API}/attendance/${classId}?date=${date}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      return res.json()
    }
  })
}

export function useMarkAttendance() {
  return useMutation({
    mutationFn: async (data: AttendancePayload) => {
      const res = await fetch(`${API}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(data)
      })
      return res.json()
    }
  })
}
```

---

## Offline Attendance (Dexie.js Pattern)

When the teacher has no internet, save attendance to IndexedDB and sync later:

```typescript
// lib/db.ts
import Dexie from 'dexie'

export const db = new Dexie('EduTrackOffline')
db.version(1).stores({
  pendingAttendance: '++id, classId, date, synced'
})
```

---

## Folder Structure Inside apps/web

```
apps/web/
├── app/                    # Next.js App Router pages
│   ├── (auth)/login/
│   ├── dashboard/
│   ├── classes/[id]/
│   │   ├── attendance/
│   │   ├── fees/
│   │   └── results/
│   ├── students/[id]/
│   ├── settings/
│   └── parent/[token]/
├── components/
│   ├── attendance/
│   ├── fees/
│   ├── charts/
│   └── ui/                 # shadcn/ui components live here
├── hooks/                  # TanStack Query hooks per domain
├── lib/
│   ├── db.ts               # Dexie offline DB
│   ├── api.ts              # fetch wrapper with auth headers
│   └── utils.ts
└── store/                  # Zustand stores
    ├── authStore.ts
    └── classStore.ts
```

---

## Branching Rules

- Your branches: `feat/ui-*`, `feat/web-*`
- Examples: `feat/ui-attendance`, `feat/web-parent-portal`, `feat/ui-fee-dashboard`
- Always branch from `main`, open a PR, pass CI before merging
- Commit format: `feat(web): add offline attendance sync with Dexie`

---

## Env Variables You Need

```
NEXT_PUBLIC_API_URL=http://localhost:4000   # your teammate's API
NEXTAUTH_SECRET=your_32_char_secret_here
```

That's it. All other secrets (DB, Redis, Twilio) are your teammate's concern.

---

## Resources

- Next.js App Router: https://nextjs.org/docs
- shadcn/ui components: https://ui.shadcn.com
- TanStack Query: https://tanstack.com/query/latest
- Recharts: https://recharts.org
- Dexie.js (offline): https://dexie.org
- Tailwind CSS: https://tailwindcss.com/docs
- Turborepo Docs: https://turbo.build/repo/docs
