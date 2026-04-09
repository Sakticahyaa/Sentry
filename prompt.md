# Hyke Todo — Custom To-Do List Web App

## Project Overview
Build a production-ready to-do list web application for task management. This app will be used by a CEO/PM to manage tasks across multiple business branches (Meroket, Roetix, Yutaka/Batin, Thesis, Hyke) with daily/weekly planning capabilities.

## Tech Stack
- **Frontend:** Vite, TypeScript
- **Database & Backend:** Supabase (PostgreSQL, REST API, Auth)
- **Hosting:** Vercel (free tier)

## Core Features

### 1. Task Management (CRUD)
- Create, Read, Update, Delete tasks
- Fields per task:
  - `id` — auto-generated UUID
  - `title` — string, required
  - `branch` — enum: "Meroket", "Thesis", "Yutaka", "Roetix", "Batin", "Hyke" (can be added or deleted, when deleted the task will have no branch)
  - `deadline` — date (YYYY-MM-DD), optional
  - `priority` — integer (1-5, 1 = highest)
  - `status` — enum: "Not Yet", "Ongoing", "Done"
  - `notes` — text, optional
  - `assigned_date` — date (YYYY-MM-DD), optional (when the user plans to work on it)
  - `estimated_time` — float in hours (e.g., 1.5), optional
  - `time_block` — enum: "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "H0", "H1", "H2", "H3", optional
  - `order` — integer for manual ordering within a view
  - `created_at` — timestamp
  - `updated_at` — timestamp

### 2. Time Block System
Define constants:
- **Quarters (Q):** Q1 (06:00-09:00), Q2 (09:00-12:00), Q3 (12:00-15:00), Q4 (15:00-18:00), Q5 (18:00-21:00), Q6 (21:00-00:00)
- **Halves (H):** H0 (00:00-06:00), H1 (Q1+Q2, 06:00-12:00), H2 (Q3+Q4, 12:00-18:00), H3 (Q5+Q6, 18:00-00:00)

### 3. Views
- **Daily View:** Tasks grouped by `assigned_date` for a specific day. Within each day, optionally group by `time_block`.
- **Weekly View:** 7-day calendar showing tasks spread across days. Show total `estimated_time` per day to prevent overcommitment.
- **Board View:** Kanban-style columns: Not Yet, Ongoing, Done. Filterable by branch.
- **Branch View:** All tasks for a specific branch, sorted by deadline.

### 4. Filtering & Sorting
- Filter by: branch, status, assigned_date range, priority, time_block
- Sort by: deadline, priority, assigned_date, order (manual drag & drop)
- Search by title/notes

### 5. Drag & Drop
- Reorder tasks within a view (updates `order` field)
- Move task between days (updates `assigned_date`)
- Move task between status columns (updates `status`)
- Use a library like `@dnd-kit/core` or `react-beautiful-dnd`

### 6. Quick Actions
- Toggle task status (Not Yet ↔ Ongoing ↔ Done) with one click
- Bulk actions: mark multiple tasks as done, assign date to multiple tasks

### 7. Daily Digest / Summary
- Show total estimated hours per day
- Show warning when total estimated time exceeds 12 hours in a day (overcommitment warning)
- Show count of tasks per status per branch

### 8. Analytics Dashboard (Simple)
- Completion rate per branch
- Tasks completed this week/month
- Average time between assignment and completion
- Overdue tasks count

## Database Schema (Supabase)

### Table: `tasks`
```sql
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  branch TEXT NOT NULL CHECK (branch IN ('Meroket', 'Thesis', 'Yutaka', 'Roetix', 'Batin', 'Hyke')),
  deadline DATE,
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  status TEXT DEFAULT 'Not Yet' CHECK (status IN ('Not Yet', 'Ongoing', 'Done')),
  notes TEXT,
  assigned_date DATE,
  estimated_time FLOAT,
  time_block TEXT CHECK (time_block IN ('Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'H0', 'H1', 'H2', 'H3')),
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)
- Enable RLS on `tasks` table
- Only authenticated users can CRUD
- All authenticated users can read/write all tasks (single user app, but support for future team expansion)

## API Design (Supabase auto-generates most of this)

Supabase provides auto-generated REST API. The frontend will use `@supabase/supabase-js` client. Additionally, provide a **service role API key** for external access (AI assistant integration).

### Custom API Layer (Optional)
If additional logic is needed, create Supabase Edge Functions:

1. **GET /tasks** — List tasks with filters
   - Query params: `branch`, `status`, `assigned_date`, `assigned_date_gte`, `assigned_date_lte`, `time_block`, `priority_gte`, `search`
   - Default sort: `order ASC, created_at DESC`

2. **POST /tasks** — Create task

3. **PUT /tasks/:id** — Update task

4. **DELETE /tasks/:id** — Delete task

5. **PATCH /tasks/:id/status** — Quick status toggle
   - Body: `{ "status": "Ongoing" }` or `{ "status": "Done" }`

6. **POST /tasks/bulk-update** — Bulk assign date/status
   - Body: `{ "task_ids": [...], "assigned_date": "2026-04-10" }`

7. **GET /tasks/summary** — Daily/weekly summary
   - Returns: total hours per day, task counts per status, overdue tasks

## Authentication
- Supabase Auth with email/password
- Initial user: admin@test-alpha.batin.ai (or new email to be set)
- Simple login page, no complex auth flows needed
- JWT-based, tokens stored in httpOnly cookies

## UI/UX Guidelines

### Design
- Clean, minimal, modern design
- Dark mode support (default dark, toggle to light)
- Mobile-responsive (the CEO often uses mobile)
- Use Tailwind CSS with a cohesive color palette

### Color Coding per Branch
- Meroket → Red/Tomato (#E74C3C)
- Thesis → Yellow/Banana (#F1C40F)
- Yutaka → Teal/Peacock (#1ABC9C)
- Roetix → Purple/Grape (#8E44AD)
- Batin → Teal/Peacock (#1ABC9C) (same as Yutaka — under ArachnoVa)
- Hyke → Blue/Lavender (#3498DB)

### Priority Indicators
- Priority 1 → 🔴 Critical
- Priority 2 → 🟠 High
- Priority 3 → 🟡 Medium
- Priority 4 → 🔵 Low
- Priority 5 → ⚪ Optional

### Layout
- **Sidebar:** Branch filters, view switcher (Daily/Weekly/Board/Branch), quick add button
- **Main area:** Task list/calendar/kanban depending on view
- **Header:** Current date, search bar, user menu, dark mode toggle
- **Task card:** Title, branch badge, priority indicator, deadline (days left), estimated time, time block, quick actions (edit, delete, toggle status)

### Interactions
- Click task card to expand/edit (modal or slide-in panel)
- Inline editing for quick changes (title, status)
- Drag handle for reordering
- Smooth animations for drag & drop, status changes

## AI Assistant Integration
This app will also be accessed by an AI assistant (Sylvie) via Supabase REST API using a service role key. Ensure:
- All CRUD operations work via REST API (not just client-side)
- API responses are clean JSON
- No complex auth required for service role access
- The AI can: list tasks, create tasks, update status, assign dates, get summaries

## Deployment
- Frontend: Vercel (connected to GitHub repo)
- Backend/DB: Supabase (cloud, free tier)
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## Additional Notes
- Keep the app simple and fast — this is a productivity tool, not a complex project management suite
- The user is a busy CEO/PM who needs quick access on mobile
- Focus on the daily view as the primary view — that's the most used one
- Overcommitment warning is important — warn when a day has >12 hours of estimated tasks
- Don't over-engineer. Ship fast, iterate later.
- Use Indonesian for UI labels/comments where appropriate (the user is Indonesian)
