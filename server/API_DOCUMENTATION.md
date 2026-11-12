# Club Event & Workshop Management System — API Documentation

REST API for the university **Club Event & Workshop Management System**, built with
**Node.js + Express 5 + TypeScript + Prisma 7 + PostgreSQL**.

- **Base URL:** `http://localhost:5050/api`
- **Format:** All request and response bodies are JSON (`Content-Type: application/json`).
- **IDs:** All IDs are auto-increment integers.
- **Dates:** ISO-8601 strings, e.g. `2026-12-01T10:00:00.000Z`.
- **Postman:** import `Club_Event_API.postman_collection.json`. It covers all 70 endpoints in workflow order and saves tokens and IDs automatically.
- **Decimals:** Money and score fields (`amountFunded`, `finalScore`, …) are returned as strings, e.g. `"60000"`, to keep their exact precision.

---

## Table of Contents

1. [Authentication & Roles](#1-authentication--roles)
2. [Response Format](#2-response-format)
3. [Main Workflow](#3-main-workflow)
4. [Auth](#4-auth) — `/api/auth`
5. [Users](#5-users) — `/api/users`
6. [Departments](#6-departments) — `/api/departments`
7. [Clubs](#7-clubs) — `/api/clubs`
8. [Venues](#8-venues) — `/api/venues`
9. [Events](#9-events) — `/api/events`
10. [Workshops](#10-workshops) — `/api/workshops`
11. [Registrations](#11-registrations) — `/api/registrations`
12. [Certificates](#12-certificates) — `/api/certificates`
13. [Sponsors](#13-sponsors) — `/api/sponsors`
14. [Event Sponsors (Sponsorship Ledger)](#14-event-sponsors-sponsorship-ledger) — `/api/event-sponsors`
15. [Feedbacks (Anonymous)](#15-feedbacks-anonymous) — `/api/feedbacks`
16. [Club Rankings](#16-club-rankings) — `/api/rankings`
17. [Notifications](#17-notifications) — `/api/notifications`
18. [Audit Logs](#18-audit-logs) — `/api/audit-logs`
19. [Dashboard](#19-dashboard) — `/api/dashboard`
20. [Enums](#20-enums)
21. [Endpoint Summary Table](#21-endpoint-summary-table)

---

## 1. Authentication & Roles

The API uses **JWT** authentication.

1. Call `POST /api/auth/login` to get an `accessToken`.
2. Send it with every protected request:

```
Authorization: Bearer <accessToken>
```

(Login also sets an `accessToken` cookie, so browser clients work without the header.)

| Role      | Who                     | Can do                                                                                                   |
| --------- | ----------------------- | -------------------------------------------------------------------------------------------------------- |
| `STUDENT` | General student         | Browse events, propose events, register, cancel registration, submit anonymous feedback, view/download own certificates, read notifications |
| `ADMIN`   | System admin / advisor  | Everything: approve/reject events, manage clubs/venues/departments, sponsors & ledger, mark attendance, issue certificates, generate rankings, view audit logs and dashboard |

**Access labels used in this document**

| Label       | Meaning                                  |
| ----------- | ---------------------------------------- |
| **Public**  | No token needed                          |
| **Auth**    | Any logged-in user (STUDENT or ADMIN)    |
| **Student** | Logged-in user with role `STUDENT`       |
| **Admin**   | Logged-in user with role `ADMIN`         |

**Default admin account** (created by `npm run seed`): `admin@club.edu` / `admin123`.
Public registration always creates a `STUDENT`. An admin can promote a user with `PATCH /api/users/:id/role`.

---

## 2. Response Format

### Success

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Events retrieved",
  "data": { }
}
```

### Error

```json
{
  "success": false,
  "statusCode": 400,
  "name": "ZodError",
  "message": "rating: Too big: expected number to be <=5"
}
```

> When `NODE_ENV=development`, error responses also include `error` and `stack` for debugging.

### Status codes

| Code | Meaning                                                                   |
| ---- | ------------------------------------------------------------------------- |
| 200  | OK                                                                        |
| 201  | Created                                                                   |
| 400  | Validation failed, invalid ID, invalid JSON, or a business-rule violation |
| 401  | Missing / invalid / expired token, or wrong login credentials             |
| 403  | Logged in but not allowed (wrong role or not the owner)                   |
| 404  | Record or route not found                                                 |
| 409  | Conflict (already registered, already issued, duplicate email, …)        |
| 500  | Unexpected server error                                                   |

---

## 3. Main Workflow

This follows the flowchart in the project proposal (Figure 1):

```
 1. Student registers & logs in              POST /api/auth/register, POST /api/auth/login
 2. Role verification (JWT)                  handled by the auth middleware on every request
 3. Student proposes an event (PENDING)      POST /api/events
 4. Admin approves the event                 PATCH /api/events/:id/status  { "status": "APPROVED" }
 5. Students browse events & workshops       GET /api/events?upcoming=true
 6. Student registers -> gets a pass         POST /api/registrations   (passNumber "REG-<id>")
 7. Admin marks attendance                   PATCH /api/registrations/:id/attend
 8. Student submits anonymous feedback       POST /api/feedbacks
 9. Admin issues certificates                POST /api/certificates/event/:eventId
10. Admin records sponsorship funding        POST /api/event-sponsors
11. Admin marks event COMPLETED              PATCH /api/events/:id/status  { "status": "COMPLETED" }
12. Admin generates annual ranking           POST /api/rankings/generate  { "year": 2026 }
13. Audit trail & dashboard are updated      GET /api/audit-logs, GET /api/dashboard/stats
```

Notifications are created automatically along the way (registration confirmed, event approved, attendance marked, certificate ready, and so on).

---

## 4. Auth

### 4.1 Register — `POST /api/auth/register`  · Public

Creates a new **STUDENT** account.

**Body**

| Field          | Type   | Required | Notes                    |
| -------------- | ------ | -------- | ------------------------ |
| `studentId`    | string | yes      | Unique university ID     |
| `fullName`     | string | yes      | Minimum 2 characters     |
| `email`        | string | yes      | Unique, valid email      |
| `password`     | string | yes      | Minimum 6 characters     |
| `departmentId` | number | no       | Must be an existing department |

```json
{
  "studentId": "CSE-2201",
  "fullName": "Alice Rahman",
  "email": "alice@uni.edu",
  "password": "secret12",
  "departmentId": 1
}
```

**Response 201**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Registration successful",
  "data": {
    "id": 2,
    "studentId": "CSE-2201",
    "fullName": "Alice Rahman",
    "email": "alice@uni.edu",
    "role": "STUDENT",
    "departmentId": 1,
    "createdAt": "2026-11-12T17:20:00.000Z"
  }
}
```

**Errors:** `400` validation error · `409` email or student ID already registered

---

### 4.2 Login — `POST /api/auth/login`  · Public

**Body**

```json
{ "email": "alice@uni.edu", "password": "secret12" }
```

**Response 200**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 2,
      "studentId": "CSE-2201",
      "fullName": "Alice Rahman",
      "email": "alice@uni.edu",
      "role": "STUDENT",
      "departmentId": 1,
      "createdAt": "2026-11-12T17:20:00.000Z"
    }
  }
}
```

**Errors:** `401` invalid email or password

---

### 4.3 Logout — `POST /api/auth/logout`  · Public

Clears the `accessToken` cookie. Clients that use the header just delete the stored token.

---

### 4.4 My Profile — `GET /api/auth/me`  · Auth

Returns the logged-in user with their department.

```json
{
  "data": {
    "id": 2,
    "studentId": "CSE-2201",
    "fullName": "Alice Rahman",
    "email": "alice@uni.edu",
    "role": "STUDENT",
    "departmentId": 1,
    "createdAt": "2026-11-12T17:20:00.000Z",
    "department": { "id": 1, "departmentName": "Computer Science & Engineering", "createdAt": "..." }
  }
}
```

---

## 5. Users

### 5.1 Update My Profile — `PATCH /api/users/me`  · Auth

| Field          | Type           | Required |
| -------------- | -------------- | -------- |
| `fullName`     | string         | no       |
| `departmentId` | number \| null | no       |
| `password`     | string (≥ 6)   | no       |

```json
{ "fullName": "Alice R.", "departmentId": 1 }
```

### 5.2 List Users — `GET /api/users`  · Admin

**Query parameters (all optional)**

| Param          | Example          | Description                              |
| -------------- | ---------------- | ---------------------------------------- |
| `role`         | `STUDENT`        | Filter by role                           |
| `departmentId` | `1`              | Filter by department                     |
| `search`       | `alice`          | Search name, email or student ID         |

### 5.3 Get User — `GET /api/users/:id`  · Admin

Returns the user, their department, and `_count.registrations`.

### 5.4 Change Role — `PATCH /api/users/:id/role`  · Admin

```json
{ "role": "ADMIN" }
```

### 5.5 Delete User — `DELETE /api/users/:id`  · Admin

Deletes the user and their registrations and notifications (cascade).

---

## 6. Departments

| Method | Endpoint                 | Access | Description                                   |
| ------ | ------------------------ | ------ | --------------------------------------------- |
| GET    | `/api/departments`       | Public | List departments with user and club counts    |
| GET    | `/api/departments/:id`   | Public | Department with its clubs                     |
| POST   | `/api/departments`       | Admin  | Create                                        |
| PATCH  | `/api/departments/:id`   | Admin  | Update                                        |
| DELETE | `/api/departments/:id`   | Admin  | Delete (users/clubs keep existing, `departmentId` becomes `null`) |

**Body (POST / PATCH)**

```json
{ "departmentName": "Computer Science & Engineering" }
```

**Response example (GET list)**

```json
{
  "data": [
    {
      "id": 1,
      "departmentName": "Computer Science & Engineering",
      "createdAt": "2026-11-12T17:15:00.000Z",
      "_count": { "users": 12, "clubs": 3 }
    }
  ]
}
```

---

## 7. Clubs

| Method | Endpoint           | Access | Description                                       |
| ------ | ------------------ | ------ | ------------------------------------------------- |
| GET    | `/api/clubs`       | Public | List clubs (filters: `departmentId`, `search`)    |
| GET    | `/api/clubs/:id`   | Public | Club with department, events and ranking history  |
| POST   | `/api/clubs`       | Admin  | Create a club                                     |
| PATCH  | `/api/clubs/:id`   | Admin  | Update a club                                     |
| DELETE | `/api/clubs/:id`   | Admin  | Delete a club (its events are deleted too)        |

**Body (POST)**

| Field             | Type   | Required |
| ----------------- | ------ | -------- |
| `clubName`        | string | yes (unique) |
| `description`     | string | no       |
| `departmentId`    | number | no       |
| `establishedYear` | number | no       |

```json
{
  "clubName": "CSE Programming Club",
  "description": "Competitive programming and coding workshops",
  "departmentId": 1,
  "establishedYear": 2015
}
```

PATCH accepts the same fields, all optional.

---

## 8. Venues

| Method | Endpoint            | Access | Description                         |
| ------ | ------------------- | ------ | ----------------------------------- |
| GET    | `/api/venues`       | Public | List venues with event counts       |
| GET    | `/api/venues/:id`   | Public | Venue with its events               |
| POST   | `/api/venues`       | Admin  | Create a venue                      |
| PATCH  | `/api/venues/:id`   | Admin  | Update a venue                      |
| DELETE | `/api/venues/:id`   | Admin  | Delete (events keep existing, `venueId` becomes `null`) |

**Body**

```json
{ "venueName": "Main Auditorium", "location": "Academic Building A, Ground Floor" }
```

---

## 9. Events

### 9.1 List / Browse Events — `GET /api/events`  · Public

**Query parameters (all optional)**

| Param       | Example     | Description                                                   |
| ----------- | ----------- | ------------------------------------------------------------- |
| `upcoming`  | `true`      | Only **APPROVED** events that haven't started yet             |
| `status`    | `PENDING`   | Filter by event status (see [Enums](#20-enums))               |
| `clubId`    | `1`         | Events of one club                                            |
| `venueId`   | `2`         | Events at one venue                                           |
| `eventType` | `WORKSHOP`  | Tag-based filter, case-insensitive                            |
| `search`    | `git`       | Search in the title                                           |

Example: `GET /api/events?upcoming=true&eventType=workshop`

**Response 200**

```json
{
  "data": [
    {
      "id": 1,
      "clubId": 1,
      "venueId": 1,
      "title": "Intro to Git",
      "description": "Hands-on Git",
      "eventType": "WORKSHOP",
      "startTime": "2026-12-01T10:00:00.000Z",
      "endTime": "2026-12-01T14:00:00.000Z",
      "status": "APPROVED",
      "createdById": 2,
      "createdAt": "2026-11-12T17:20:00.000Z",
      "club": { "id": 1, "clubName": "CSE Programming Club" },
      "venue": { "id": 1, "venueName": "Main Auditorium", "location": "..." },
      "workshop": { "id": 1, "eventId": 1, "speakerName": "Dr. Rahman", "speakerBio": null, "prerequisites": "Laptop" },
      "_count": { "registrations": 2 }
    }
  ]
}
```

### 9.2 Event Details — `GET /api/events/:id`  · Public

Returns the event with `club`, `venue`, `workshop`, `createdBy`, `sponsors` (with sponsor info),
`_count.registrations`, `_count.feedbacks` and `averageRating`.

### 9.3 Create / Propose Event — `POST /api/events`  · Auth

- If a **STUDENT** creates it → status is `PENDING` (needs admin approval).
- If an **ADMIN** creates it → status is `APPROVED` immediately.

**Body**

| Field         | Type     | Required | Notes                                           |
| ------------- | -------- | -------- | ----------------------------------------------- |
| `clubId`      | number   | yes      | Organizing club                                 |
| `venueId`     | number   | no       |                                                 |
| `title`       | string   | yes      | Minimum 3 characters                            |
| `description` | string   | no       |                                                 |
| `eventType`   | string   | no       | Free tag, e.g. `WORKSHOP`, `HACKATHON`, `SEMINAR`, `SOCIAL` |
| `startTime`   | datetime | yes      |                                                 |
| `endTime`     | datetime | yes      | Must be after `startTime`                       |
| `workshop`    | object   | no       | Creates the 1:1 workshop record in the same request |
| `workshop.speakerName`   | string | yes (if `workshop` is sent) |           |
| `workshop.speakerBio`    | string | no      |                                         |
| `workshop.prerequisites` | string | no      |                                         |

```json
{
  "clubId": 1,
  "venueId": 1,
  "title": "Intro to Git",
  "eventType": "WORKSHOP",
  "startTime": "2026-12-01T10:00:00.000Z",
  "endTime": "2026-12-01T14:00:00.000Z",
  "workshop": { "speakerName": "Dr. Rahman", "prerequisites": "Laptop" }
}
```

**Response 201:** the created event, including `workshop`.

### 9.4 Update Event — `PATCH /api/events/:id`  · Auth (creator or admin)

Any of: `clubId`, `venueId` (or `null`), `title`, `description`, `eventType`, `startTime`, `endTime`.
**Errors:** `403` if you are not the creator or an admin.

### 9.5 Change Event Status (Approve / Reject / Complete / Cancel) — `PATCH /api/events/:id/status`  · Admin

```json
{ "status": "APPROVED" }
```

Allowed values: `PENDING`, `APPROVED`, `REJECTED`, `COMPLETED`, `CANCELLED`.

Side effects:
- The event creator gets a notification.
- On `CANCELLED`, every registered student gets a notification.
- An audit log entry is written, e.g. `EVENT_APPROVED`.

> Only `COMPLETED` events count toward the annual club ranking.

### 9.6 Delete Event — `DELETE /api/events/:id`  · Admin

Also deletes its workshop, registrations, certificates, feedback and sponsorship entries (cascade).

### 9.7 Event Participants — `GET /api/events/:id/registrations`  · Admin

All registrations of the event with student info and certificate (if issued).

---

## 10. Workshops

A workshop **extends an event 1:1** with speaker details. You can create it together with the event
(see 9.3) or separately here.

| Method | Endpoint              | Access | Description                               |
| ------ | --------------------- | ------ | ----------------------------------------- |
| GET    | `/api/workshops`      | Public | List workshops with their event, club and venue |
| GET    | `/api/workshops/:id`  | Public | One workshop                              |
| POST   | `/api/workshops`      | Admin  | Attach workshop details to an event       |
| PATCH  | `/api/workshops/:id`  | Admin  | Update speaker / prerequisites            |
| DELETE | `/api/workshops/:id`  | Admin  | Remove workshop details (the event stays) |

**Body (POST)**

```json
{
  "eventId": 2,
  "speakerName": "Jane Doe",
  "speakerBio": "ML engineer at TechCorp",
  "prerequisites": "Python basics"
}
```

**Errors:** `404` event not found · `409` event already has workshop details

---

## 11. Registrations

### 11.1 Register for an Event — `POST /api/registrations`  · Student

```json
{ "eventId": 1 }
```

Rules:
- The event must be `APPROVED` and must not have ended.
- A student can register only once per event. If they cancelled before, the same registration is re-activated.

**Response 201** — the registration acts as the **event pass**:

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Registration confirmed",
  "data": {
    "id": 1,
    "eventId": 1,
    "userId": 2,
    "status": "CONFIRMED",
    "registeredAt": "2026-11-12T17:20:00.000Z",
    "event": { "id": 1, "title": "Intro to Git", "club": { "id": 1, "clubName": "..." }, "venue": { } },
    "passNumber": "REG-1"
  }
}
```

**Errors:** `400` event not approved or already ended · `404` event not found · `409` already registered

### 11.2 My Registrations — `GET /api/registrations/my`  · Auth

The logged-in student's registrations with event, club, venue and certificate.

### 11.3 All Registrations — `GET /api/registrations`  · Admin

Query parameters: `eventId`, `status` (`CONFIRMED` | `ATTENDED` | `CANCELLED`).

### 11.4 Cancel Registration — `PATCH /api/registrations/:id/cancel`  · Auth (owner or admin)

Only `CONFIRMED` registrations can be cancelled.

### 11.5 Mark Attended — `PATCH /api/registrations/:id/attend`  · Admin

Changes status `CONFIRMED` → `ATTENDED`. This unlocks **feedback** and **certificate** for the student,
and sends them a notification.

---

## 12. Certificates

| Method | Endpoint                           | Access | Description                                                  |
| ------ | ---------------------------------- | ------ | ------------------------------------------------------------ |
| POST   | `/api/certificates`                | Admin  | Issue a certificate for one registration                     |
| POST   | `/api/certificates/event/:eventId` | Admin  | Bulk-issue for every attended student of an event            |
| GET    | `/api/certificates/my`             | Auth   | My certificates (for download)                               |
| GET    | `/api/certificates`                | Admin  | All certificates                                             |
| GET    | `/api/certificates/:id`            | Auth   | One certificate (students can only see their own)            |

**Body (single issue)**

```json
{ "registrationId": 1 }
```

Rules: the registration must be `ATTENDED`; only one certificate per registration.

**Response 201**

```json
{
  "data": {
    "id": 1,
    "registrationId": 1,
    "certificateUrl": "http://localhost:5050/certificates/CERT-1.pdf",
    "issuedAt": "2026-11-12T17:25:00.000Z",
    "registration": {
      "id": 1,
      "status": "ATTENDED",
      "user": { "id": 2, "studentId": "CSE-2201", "fullName": "Alice Rahman", "email": "alice@uni.edu" },
      "event": { "id": 1, "title": "Intro to Git", "club": { "id": 1, "clubName": "CSE Programming Club" } }
    }
  }
}
```

**Bulk issue response:** `{ "eventId": 1, "issuedCount": 12 }`

> `certificateUrl` is the stored link for the certificate file. Generating the PDF itself is outside
> this backend's scope; the API returns all the data needed to render it (student, event, club, date).

---

## 13. Sponsors

| Method | Endpoint             | Access | Description                                              |
| ------ | -------------------- | ------ | -------------------------------------------------------- |
| GET    | `/api/sponsors`      | Admin  | List sponsors with `eventsSponsored` and `totalFunded`   |
| GET    | `/api/sponsors/:id`  | Admin  | Sponsor with every funded event and `totalFunded`        |
| POST   | `/api/sponsors`      | Admin  | Create a sponsor                                         |
| PATCH  | `/api/sponsors/:id`  | Admin  | Update a sponsor                                         |
| DELETE | `/api/sponsors/:id`  | Admin  | Delete a sponsor (and its ledger entries)                |

**Body**

```json
{ "companyName": "TechCorp Ltd.", "contactEmail": "sponsor@techcorp.example" }
```

**Response example (GET list)**

```json
{
  "data": [
    { "id": 1, "companyName": "TechCorp Ltd.", "contactEmail": "sponsor@techcorp.example", "eventsSponsored": 2, "totalFunded": 80000 }
  ]
}
```

---

## 14. Event Sponsors (Sponsorship Ledger)

Links a sponsor to an event with the funded amount. This is the many-to-many table between `events` and `sponsors`.

| Method | Endpoint                   | Access | Description                         |
| ------ | -------------------------- | ------ | ----------------------------------- |
| GET    | `/api/event-sponsors`      | Admin  | Ledger with grand total             |
| GET    | `/api/event-sponsors/:id`  | Admin  | One ledger entry                    |
| POST   | `/api/event-sponsors`      | Admin  | Add a funding record                |
| PATCH  | `/api/event-sponsors/:id`  | Admin  | Update amount or tier               |
| DELETE | `/api/event-sponsors/:id`  | Admin  | Remove a funding record             |

**Query parameters (GET list):** `eventId`, `sponsorId`, `clubId`

**Body (POST)**

| Field             | Type   | Required | Notes                                  |
| ----------------- | ------ | -------- | -------------------------------------- |
| `eventId`         | number | yes      |                                        |
| `sponsorId`       | number | yes      |                                        |
| `amountFunded`    | number | yes      | Must be greater than 0                 |
| `sponsorshipTier` | string | no       | e.g. `PLATINUM`, `GOLD`, `SILVER`, `BRONZE` |

```json
{ "eventId": 1, "sponsorId": 1, "amountFunded": 50000, "sponsorshipTier": "GOLD" }
```

PATCH accepts `amountFunded` and/or `sponsorshipTier`.

**Response example (GET list)**

```json
{
  "data": {
    "totalFunded": 80000,
    "count": 2,
    "entries": [
      {
        "id": 1,
        "eventId": 1,
        "sponsorId": 1,
        "amountFunded": "60000",
        "sponsorshipTier": "GOLD",
        "sponsor": { "id": 1, "companyName": "TechCorp Ltd.", "contactEmail": "..." },
        "event": { "id": 1, "title": "Intro to Git", "startTime": "...", "club": { "id": 1, "clubName": "..." } }
      }
    ]
  }
}
```

**Errors:** `400` the same sponsor is already linked to this event (duplicate) · `404` event or sponsor not found

---

## 15. Feedbacks (Anonymous)

Feedback is **anonymous**: the `feedbacks` table has **no user column**. The API checks that the
student **attended** the event before saving, but it never stores who wrote the feedback.

### 15.1 Submit Feedback — `POST /api/feedbacks`  · Student

| Field      | Type    | Required | Notes                    |
| ---------- | ------- | -------- | ------------------------ |
| `eventId`  | number  | yes      |                          |
| `rating`   | integer | yes      | 1 to 5 stars             |
| `comments` | string  | no       | Up to 1000 characters    |

```json
{ "eventId": 1, "rating": 5, "comments": "Great hands-on session!" }
```

**Response 201**

```json
{ "data": { "id": 1, "eventId": 1, "rating": 5, "comments": "Great hands-on session!", "submittedAt": "..." } }
```

**Errors:** `400` rating outside 1–5 · `403` you did not attend this event

### 15.2 Event Feedback — `GET /api/feedbacks/event/:eventId`  · Public

```json
{
  "data": {
    "event": { "id": 1, "title": "Intro to Git" },
    "averageRating": 4.5,
    "totalFeedbacks": 2,
    "feedbacks": [ { "id": 2, "eventId": 1, "rating": 4, "comments": null, "submittedAt": "..." } ]
  }
}
```

### 15.3 All Feedback — `GET /api/feedbacks`  · Admin

Query parameters: `eventId`, `rating`.

### 15.4 Delete Feedback — `DELETE /api/feedbacks/:id`  · Admin

For moderation, such as removing abusive comments.

---

## 16. Club Rankings

### Ranking Formula (3-Factor, normalized 0–100)

For a given year, only events whose `startTime` falls in that year are counted.

| Factor              | Weight | Score calculation                                              |
| ------------------- | ------ | -------------------------------------------------------------- |
| Completed events    | 35%    | `completedEvents / (highest completedEvents of any club) × 100` |
| Sponsorship funds   | 35%    | `totalSponsorship / (highest totalSponsorship of any club) × 100` |
| Student feedback    | 30%    | `averageRating / 5 × 100`                                       |

```
finalScore = 0.35 × totalEventsScore + 0.35 × sponsorshipScore + 0.30 × feedbackScore
```

Clubs are sorted by `finalScore` (highest first) and given a `rankPosition` (1 = best).

**Worked example (2026):**

| Club   | Completed events | Sponsorship | Avg rating | Events score | Sponsor score | Feedback score | **Final** | Rank |
| ------ | ---------------- | ----------- | ---------- | ------------ | ------------- | -------------- | --------- | ---- |
| Club A | 1                | 60,000      | 4.5        | 100          | 100           | 90             | **97.00** | 1    |
| Club B | 1                | 20,000      | —          | 100          | 33.33         | 0              | **46.67** | 2    |

### 16.1 Generate Rankings — `POST /api/rankings/generate`  · Admin

```json
{ "year": 2026 }
```

Calculates and saves rankings for **all clubs** for that year. Running it again for the same year
overwrites the previous results. All admins get a notification.

**Response 200**

```json
{
  "data": [
    {
      "id": 1,
      "clubId": 1,
      "year": 2026,
      "totalEventsScore": "100",
      "sponsorshipScore": "100",
      "feedbackScore": "90",
      "finalScore": "97",
      "rankPosition": 1,
      "clubName": "CSE Programming Club",
      "metrics": { "completedEvents": 1, "totalSponsorship": 60000, "averageRating": 4.5 }
    }
  ]
}
```

### 16.2 Rankings by Year — `GET /api/rankings?year=2026`  · Public

`year` defaults to the current year. Results are ordered by `rankPosition`.

### 16.3 Club Ranking History — `GET /api/rankings/club/:clubId`  · Public

```json
{ "data": { "club": { "id": 1, "clubName": "..." }, "rankings": [ { "year": 2026, "finalScore": "97", "rankPosition": 1 } ] } }
```

---

## 17. Notifications

Notifications are created **automatically** by the system:

| Trigger                              | Who receives it       |
| ------------------------------------ | --------------------- |
| Registration confirmed (with pass no.) | The student         |
| Event status changed (approved, rejected, …) | The event creator |
| Event cancelled                      | All registered students |
| Attendance marked                    | The student           |
| Certificate issued                   | The student           |
| Annual rankings generated            | All admins            |

| Method | Endpoint                          | Access | Description                                       |
| ------ | --------------------------------- | ------ | ------------------------------------------------- |
| GET    | `/api/notifications/my`           | Auth   | My notifications + `unreadCount`                  |
| PATCH  | `/api/notifications/:id/read`     | Auth   | Mark one as read                                  |
| PATCH  | `/api/notifications/read-all`     | Auth   | Mark all mine as read                             |
| DELETE | `/api/notifications/:id`          | Auth   | Delete one of mine                                |
| POST   | `/api/notifications`              | Admin  | Send to one user, or broadcast to everyone        |

**Body (POST)**

```json
{ "userId": 2, "message": "Welcome to the club portal!" }
```

Omit `userId` to broadcast to all users. Response: `{ "sentTo": 1 }`.

**Response example (GET my)**

```json
{
  "data": {
    "unreadCount": 1,
    "notifications": [
      { "id": 5, "userId": 2, "message": "Registration confirmed for \"Intro to Git\". Your pass number is REG-1.", "isRead": false, "createdAt": "..." }
    ]
  }
}
```

---

## 18. Audit Logs

### List Audit Logs — `GET /api/audit-logs`  · Admin

Every critical action is logged automatically: register/login, create/update/delete of any record,
event status changes, attendance, certificates, sponsorship changes and ranking generation.

**Query parameters (optional)**

| Param        | Example         | Description                              |
| ------------ | --------------- | ---------------------------------------- |
| `userId`     | `1`             | Actions done by one user                 |
| `action`     | `EVENT`         | Text search in the action name           |
| `entityType` | `events`        | Table name: `events`, `clubs`, `users`, … |
| `limit`      | `50`            | Max rows (default 100)                   |

**Response example**

```json
{
  "data": [
    {
      "id": 42,
      "userId": 1,
      "action": "EVENT_APPROVED",
      "entityType": "events",
      "entityId": 1,
      "timestamp": "2026-11-12T17:22:00.000Z",
      "user": { "id": 1, "fullName": "System Admin", "email": "admin@club.edu", "role": "ADMIN" }
    }
  ]
}
```

> `FEEDBACK_SUBMITTED` logs are stored **without** a `userId`, so feedback stays anonymous.

---

## 19. Dashboard

### Admin Stats — `GET /api/dashboard/stats`  · Admin

```json
{
  "data": {
    "totalUsers": 3,
    "totalStudents": 2,
    "totalClubs": 4,
    "totalEvents": 2,
    "eventsByStatus": { "COMPLETED": 2 },
    "totalRegistrations": 2,
    "totalCertificates": 2,
    "totalSponsorship": 80000,
    "totalFeedbacks": 2,
    "averageRating": 4.5
  }
}
```

---

## 20. Enums

| Enum                 | Values                                                       |
| -------------------- | ------------------------------------------------------------ |
| `Role`               | `STUDENT`, `ADMIN`                                           |
| `EventStatus`        | `PENDING`, `APPROVED`, `REJECTED`, `COMPLETED`, `CANCELLED`  |
| `RegistrationStatus` | `CONFIRMED`, `ATTENDED`, `CANCELLED`                         |

---

## 21. Endpoint Summary Table

| #  | Method | Endpoint                               | Access        |
| -- | ------ | -------------------------------------- | ------------- |
| 1  | POST   | `/api/auth/register`                   | Public        |
| 2  | POST   | `/api/auth/login`                      | Public        |
| 3  | POST   | `/api/auth/logout`                     | Public        |
| 4  | GET    | `/api/auth/me`                         | Auth          |
| 5  | PATCH  | `/api/users/me`                        | Auth          |
| 6  | GET    | `/api/users`                           | Admin         |
| 7  | GET    | `/api/users/:id`                       | Admin         |
| 8  | PATCH  | `/api/users/:id/role`                  | Admin         |
| 9  | DELETE | `/api/users/:id`                       | Admin         |
| 10 | GET    | `/api/departments`                     | Public        |
| 11 | GET    | `/api/departments/:id`                 | Public        |
| 12 | POST   | `/api/departments`                     | Admin         |
| 13 | PATCH  | `/api/departments/:id`                 | Admin         |
| 14 | DELETE | `/api/departments/:id`                 | Admin         |
| 15 | GET    | `/api/clubs`                           | Public        |
| 16 | GET    | `/api/clubs/:id`                       | Public        |
| 17 | POST   | `/api/clubs`                           | Admin         |
| 18 | PATCH  | `/api/clubs/:id`                       | Admin         |
| 19 | DELETE | `/api/clubs/:id`                       | Admin         |
| 20 | GET    | `/api/venues`                          | Public        |
| 21 | GET    | `/api/venues/:id`                      | Public        |
| 22 | POST   | `/api/venues`                          | Admin         |
| 23 | PATCH  | `/api/venues/:id`                      | Admin         |
| 24 | DELETE | `/api/venues/:id`                      | Admin         |
| 25 | GET    | `/api/events`                          | Public        |
| 26 | GET    | `/api/events/:id`                      | Public        |
| 27 | POST   | `/api/events`                          | Auth          |
| 28 | PATCH  | `/api/events/:id`                      | Creator/Admin |
| 29 | PATCH  | `/api/events/:id/status`               | Admin         |
| 30 | DELETE | `/api/events/:id`                      | Admin         |
| 31 | GET    | `/api/events/:id/registrations`        | Admin         |
| 32 | GET    | `/api/workshops`                       | Public        |
| 33 | GET    | `/api/workshops/:id`                   | Public        |
| 34 | POST   | `/api/workshops`                       | Admin         |
| 35 | PATCH  | `/api/workshops/:id`                   | Admin         |
| 36 | DELETE | `/api/workshops/:id`                   | Admin         |
| 37 | POST   | `/api/registrations`                   | Student       |
| 38 | GET    | `/api/registrations/my`                | Auth          |
| 39 | GET    | `/api/registrations`                   | Admin         |
| 40 | PATCH  | `/api/registrations/:id/cancel`        | Owner/Admin   |
| 41 | PATCH  | `/api/registrations/:id/attend`        | Admin         |
| 42 | POST   | `/api/certificates`                    | Admin         |
| 43 | POST   | `/api/certificates/event/:eventId`     | Admin         |
| 44 | GET    | `/api/certificates/my`                 | Auth          |
| 45 | GET    | `/api/certificates`                    | Admin         |
| 46 | GET    | `/api/certificates/:id`                | Owner/Admin   |
| 47 | GET    | `/api/sponsors`                        | Admin         |
| 48 | GET    | `/api/sponsors/:id`                    | Admin         |
| 49 | POST   | `/api/sponsors`                        | Admin         |
| 50 | PATCH  | `/api/sponsors/:id`                    | Admin         |
| 51 | DELETE | `/api/sponsors/:id`                    | Admin         |
| 52 | GET    | `/api/event-sponsors`                  | Admin         |
| 53 | GET    | `/api/event-sponsors/:id`              | Admin         |
| 54 | POST   | `/api/event-sponsors`                  | Admin         |
| 55 | PATCH  | `/api/event-sponsors/:id`              | Admin         |
| 56 | DELETE | `/api/event-sponsors/:id`              | Admin         |
| 57 | POST   | `/api/feedbacks`                       | Student       |
| 58 | GET    | `/api/feedbacks/event/:eventId`        | Public        |
| 59 | GET    | `/api/feedbacks`                       | Admin         |
| 60 | DELETE | `/api/feedbacks/:id`                   | Admin         |
| 61 | POST   | `/api/rankings/generate`               | Admin         |
| 62 | GET    | `/api/rankings`                        | Public        |
| 63 | GET    | `/api/rankings/club/:clubId`           | Public        |
| 64 | GET    | `/api/notifications/my`                | Auth          |
| 65 | PATCH  | `/api/notifications/:id/read`          | Auth          |
| 66 | PATCH  | `/api/notifications/read-all`          | Auth          |
| 67 | DELETE | `/api/notifications/:id`               | Auth          |
| 68 | POST   | `/api/notifications`                   | Admin         |
| 69 | GET    | `/api/audit-logs`                      | Admin         |
| 70 | GET    | `/api/dashboard/stats`                 | Admin         |
