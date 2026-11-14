# ClubVerse — University Club & Event Management Frontend

Modern, interactive, and responsive web client for the University Club Event & Workshop Management System.

Built with **React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons**.

---

## Features

- **Events & Workshops Catalog**:
  - Filter by event type (`WORKSHOP`, `HACKATHON`, `SEMINAR`, `COMPETITION`, `SOCIAL`), venue, and club.
  - Search by title, description, or speaker name.
  - Interactive event detail modal with speaker bio, prerequisites, and corporate sponsor ledger.
  - 1-Click event registration with instant digital ticket pass generation.

- **Digital Event Pass (`REG-<id>`)**:
  - Official digital entry ticket with pass number, student details, venue, date/time, and simulated QR check-in code.
  - Print / Save to PDF support.

- **Clubs Directory & Annual 3-Factor Leaderboard**:
  - Interactive ranking visualizer using the official university formula:
    $$\text{Final Score} = 0.35 \times \text{Events} + 0.35 \times \text{Sponsorship} + 0.30 \times \text{Feedback}$$
  - Dynamic score breakdown progress bars and historical year selector (2026, 2025, 2024).

- **Student Portal ("My Activity")**:
  - **My Passes**: Active event passes with live status badges (`CONFIRMED`, `ATTENDED`, `CANCELLED`).
  - **100% Anonymous Feedback**: Unlocks once attendance is verified by administrators, directly impacting club ranking.
  - **Verified Certificates**: Verifiable participation credentials with university seal, printable format, and credential IDs.

- **Administrator Hub (`/admin`)**:
  - System-wide KPI dashboard (Total Users, Clubs, Events, Sponsorship Funds, Average Ratings).
  - Event moderation (1-click Approve, Reject, or Mark Completed).
  - Check-in & Certification Desk (Check-in attendees, mass issue certificates).
  - Sponsorship Ledger (Record corporate funding and tier: Title, Platinum, Gold, Silver).
  - Annual Rankings Generator (Run algorithm for any academic year).
  - Live system security & audit trail.

- **Public Certificate Verification (`/verify`)**:
  - Instant public verification of any issued certificate ID.

- **Dual Mode Connectivity**:
  - **API Connected Mode**: Proxies to `http://localhost:5050/api` with JWT Bearer tokens and cookie handling.
  - **Interactive Offline / Demo Mode**: Auto-detects backend state with rich mock fallback data so the entire user flow can be tested even before database setup!
  - **1-Click Role Switcher**: Switch between `Student` and `Admin` in the top bar with zero setup.

---

## Quick Start

```bash
# 1. Navigate to the client directory
cd client

# 2. Dependencies are already installed! If needed:
npm install

# 3. Start the Vite development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

