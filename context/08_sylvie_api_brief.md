# Sylvie API Brief — Sentry Task Manager

## Access
- **Base URL:** `https://xbzjykaayibfzzljfxeo.supabase.co/rest/v1`
- **Auth header (always include both):**
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhiemp5a2FheWliZnp6bGpmeGVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTcxMDQ0NywiZXhwIjoyMDkxMjg2NDQ3fQ.4U1KlHcY3yCuIBlnLdbSE5qb0nHN9jc21oNXcVPYbjc
  apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhiemp5a2FheWliZnp6bGpmeGVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTcxMDQ0NywiZXhwIjoyMDkxMjg2NDQ3fQ.4U1KlHcY3yCuIBlnLdbSE5qb0nHN9jc21oNXcVPYbjc
  Content-Type: application/json
  Prefer: return=representation
  ```
- **Role:** service_role — bypasses RLS, full read/write access, no login needed.

---

## Data Model

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | auto-generated |
| `title` | string | required |
| `branch` | enum | `Meroket`, `Thesis`, `Yutaka`, `Roetix`, `Batin`, `Hyke`, or null |
| `deadline` | date | `YYYY-MM-DD`, optional |
| `priority` | int 1–5 | 1=Critical 🔴, 2=High 🟠, 3=Medium 🟡, 4=Low 🔵, 5=Optional ⚪ |
| `status` | enum | `Not Yet`, `Ongoing`, `Done` |
| `notes` | string | optional |
| `assigned_date` | date | `YYYY-MM-DD` — when to work on it |
| `estimated_time` | float | hours, e.g. `1.5` |
| `time_block` | enum | `Q1`–`Q6`, `H0`–`H3` (see below), optional |
| `order` | int | manual sort order |
| `created_at` | timestamp | auto |
| `updated_at` | timestamp | auto |

### Time Blocks
| Code | Hours |
|------|-------|
| Q1 | 06:00–09:00 |
| Q2 | 09:00–12:00 |
| Q3 | 12:00–15:00 |
| Q4 | 15:00–18:00 |
| Q5 | 18:00–21:00 |
| Q6 | 21:00–00:00 |
| H0 | 00:00–06:00 |
| H1 | 06:00–12:00 (Morning) |
| H2 | 12:00–18:00 (Afternoon) |
| H3 | 18:00–00:00 (Evening) |

---

## Operations

### List all tasks
```
GET /tasks?select=*&order=order.asc,created_at.desc
```

### Filter tasks
```
GET /tasks?select=*&branch=eq.Hyke
GET /tasks?select=*&status=eq.Not+Yet
GET /tasks?select=*&assigned_date=eq.2026-04-09
GET /tasks?select=*&assigned_date=gte.2026-04-07&assigned_date=lte.2026-04-13
GET /tasks?select=*&status=neq.Done&order=deadline.asc
GET /tasks?select=*&title=ilike.*keyword*
```

### Create a task
```
POST /tasks
Body: {
  "title": "Finalize pitch deck",
  "branch": "Hyke",
  "priority": 2,
  "status": "Not Yet",
  "assigned_date": "2026-04-10",
  "estimated_time": 2,
  "time_block": "Q2",
  "deadline": "2026-04-11",
  "notes": "Focus on slide 5–8"
}
```

### Update a task
```
PATCH /tasks?id=eq.<uuid>
Body: { "status": "Done" }
Body: { "assigned_date": "2026-04-10", "time_block": "Q3" }
Body: { "priority": 1, "notes": "Urgent — updated" }
```

### Delete a task
```
DELETE /tasks?id=eq.<uuid>
```

### Bulk update (e.g. reschedule multiple tasks)
```
PATCH /tasks?id=in.(<uuid1>,<uuid2>,<uuid3>)
Body: { "assigned_date": "2026-04-10" }
```

### Get today's tasks with total hours
```
GET /tasks?select=*&assigned_date=eq.2026-04-09&order=order.asc
→ sum estimated_time fields; warn if total > 12h
```

### Get overdue tasks
```
GET /tasks?select=*&deadline=lt.2026-04-09&status=neq.Done&order=deadline.asc
```

---

## Rules Sylvie Should Follow
- Always use today's date in `YYYY-MM-DD` format when assigning or filtering by date
- Default `priority` to 3 (Medium) if not specified
- Default `status` to `Not Yet` on creation
- Warn the user if adding a task to a day that already has ≥12h estimated
- When moving tasks to a new day, use `PATCH` with `assigned_date`
- Never delete tasks without confirming with the user first
- `order` field: use 0 for new tasks unless explicitly positioning them
