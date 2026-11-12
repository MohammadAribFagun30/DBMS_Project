# Club Event & Workshop Management System — Backend

REST API for a centralized university platform where clubs publish events and workshops, students register,
attend and give anonymous feedback, admins manage the sponsorship ledger, and the system calculates an
annual 3-factor club ranking.

**Full API reference:** [API_DOCUMENTATION.md](API_DOCUMENTATION.md) (70 endpoints)
**Postman collection:** [Club_Event_API.postman_collection.json](Club_Event_API.postman_collection.json): import it into Postman and run the folders in order. Tokens and IDs are saved automatically.

## Tech Stack

| Area       | Tool                                    |
| ---------- | --------------------------------------- |
| Runtime    | Node.js ≥ 20, TypeScript                |
| Framework  | Express 5                               |
| Database   | PostgreSQL + Prisma 7 ORM               |
| Validation | Zod                                     |
| Auth       | JWT (`jsonwebtoken`) + `bcryptjs`       |

## Quick Start

You need Node.js ≥ 20 and a running PostgreSQL server.

```bash
# 1. Install dependencies (this also generates the Prisma client)
npm install

# 2. Create the env file, then set DATABASE_URL to your PostgreSQL database
cp .env.example .env

# 3. Create all 14 tables
npx prisma migrate dev

# 4. Add the admin account and sample departments, venues, clubs and sponsors
npm run seed

# 5. Start the server
npm run dev
```

The API runs at `http://localhost:5050/api`.
**Admin login:** `admin@club.edu` / `admin123`. Students sign up with `POST /api/auth/register`.

> Port 5050 is used because macOS uses port 5000 for AirPlay.

## Scripts

| Command                 | What it does                                   |
| ----------------------- | ---------------------------------------------- |
| `npm run dev`           | Start the dev server with auto-reload          |
| `npm run seed`          | Insert the admin user and sample master data   |
| `npm run build`         | Build to `dist/`                               |
| `npm start`             | Run the built server                           |
| `npx prisma studio`     | Browse the database in the browser             |
| `npx prisma migrate reset` | Drop and re-create the database (then run `npm run seed`) |

## Project Structure

```
server/
├── prisma/
│   ├── schema/                 # Prisma schema, one file per domain
│   │   ├── schema.prisma       # generator + datasource
│   │   ├── enums.prisma        # Role, EventStatus, RegistrationStatus
│   │   ├── department.prisma   # departments
│   │   ├── user.prisma         # users
│   │   ├── club.prisma         # clubs, club_rankings
│   │   ├── venue.prisma        # venues
│   │   ├── event.prisma        # events, workshops
│   │   ├── registration.prisma # registrations, certificates
│   │   ├── sponsor.prisma      # sponsors, event_sponsors
│   │   ├── feedback.prisma     # feedbacks (anonymous)
│   │   └── system.prisma       # audit_logs, notifications
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── server.ts               # starts the HTTP server
│   ├── app.ts                  # express app, middleware, mounts /api
│   └── app/
│       ├── config/             # env variables
│       ├── lib/prisma.ts       # shared Prisma client
│       ├── middleware/         # auth (JWT + roles), validateRequest (Zod), error handlers
│       ├── routes/index.ts     # registers every module under /api
│       ├── utils/              # catchAsync, sendResponse, AppError, jwt, parseId, logger (audit + notify)
│       └── modules/            # one folder per feature
│           ├── auth/  user/  department/  club/  venue/
│           ├── event/  workshop/  registration/  certificate/
│           ├── sponsor/  eventSponsor/  feedback/  ranking/
│           └── auditLog/  notification/  dashboard/
└── API_DOCUMENTATION.md
```

Every module follows the same pattern:

```
<module>.route.ts        URL paths + auth/validation middleware
<module>.controller.ts   reads the request, calls the service, sends the response
<module>.services.ts     business logic and Prisma queries
<module>.validations.ts  Zod schemas for request bodies
```

## Database (14 tables, 3NF)

| Table            | Purpose                                         | Relations                                           |
| ---------------- | ----------------------------------------------- | --------------------------------------------------- |
| `departments`    | Academic departments                            | 1—M users, clubs                                    |
| `users`          | Students and admins                             | M—1 department; 1—M events, registrations, audit_logs, notifications |
| `clubs`          | Student club profiles                           | M—1 department; 1—M events, club_rankings           |
| `venues`         | Event locations                                 | 1—M events                                          |
| `events`         | Scheduled activities                            | M—1 club, venue, user (created_by); 1—1 workshop; 1—M registrations, feedbacks, event_sponsors |
| `workshops`      | Speaker details extending an event              | 1—1 events                                          |
| `registrations`  | Student sign-ups (CONFIRMED / ATTENDED / CANCELLED) | M—1 event, user; 1—1 certificate                |
| `certificates`   | Participation certificates                      | 1—1 registrations                                   |
| `sponsors`       | Corporate sponsors                              | M—M events via event_sponsors                       |
| `event_sponsors` | Sponsorship ledger (amount, tier)               | M—1 event, sponsor                                  |
| `feedbacks`      | Anonymous 1–5 ratings (no user column)          | M—1 event                                           |
| `club_rankings`  | Annual scores and rank positions                | M—1 club                                            |
| `audit_logs`     | Record of critical actions                      | M—1 user                                            |
| `notifications`  | In-app alerts                                   | M—1 user                                            |

Column names in the database match the ERD (`user_id`, `full_name`, `event_id`, …). The API uses camelCase (`id`, `fullName`, `eventId`, …).

## Key Business Rules

- **Event approval:** events proposed by students start as `PENDING`. An admin approves or rejects them. Events created by admins are `APPROVED` right away.
- **Registration:** only for `APPROVED` events that haven't ended, once per student. The registration ID is the event pass (`REG-<id>`).
- **Attendance:** an admin marks a registration `ATTENDED`, which unlocks feedback and the certificate.
- **Anonymous feedback:** only students who attended can submit feedback, and the feedback row never stores the student's ID.
- **Annual ranking:** `final = 0.35 × events + 0.35 × sponsorship + 0.30 × feedback`, each normalized to 0–100. Only `COMPLETED` events count toward the events score. See section 16 of the API docs.
- **Audit trail:** every create, update, delete and status change is written to `audit_logs`.
