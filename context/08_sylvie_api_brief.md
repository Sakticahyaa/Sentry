# Sylvie API Brief — Sentry Task Manager

## Access
- **Base URL:** `https://xbzjykaayibfzzljfxeo.supabase.co/rest/v1`
- **Auth header (always include all three):**
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
| `branch` | string | `Meroket`, `Thesis`, `Yutaka`, `Roetix`, `Batin`, `Hyke`, or null |
| `status` | enum | `Not Yet` or `Done` |
| `notes` | string | optional free text |
| `assigned_date` | date | `YYYY-MM-DD` — the day to work on it; null = backlog |
| `order` | int | manual sort order within the day |
| `created_at` | timestamp | auto |
| `updated_at` | timestamp | auto |

> **Removed fields (no longer exist):** `priority`, `deadline`, `estimated_time`, `time_block`, `Ongoing` status.

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
GET /tasks?select=*&assigned_date=eq.2026-04-21
GET /tasks?select=*&assigned_date=gte.2026-04-21&assigned_date=lte.2026-04-27
GET /tasks?select=*&title=ilike.*keyword*
GET /tasks?select=*&status=eq.Not+Yet&assigned_date=is.null
```

### Get today's tasks
```
GET /tasks?select=*&assigned_date=eq.2026-04-21&order=order.asc
```

### Get backlog (unscheduled)
```
GET /tasks?select=*&assigned_date=is.null&order=order.asc
```

### Create a task
```
POST /tasks
Body: {
  "title": "Finalize pitch deck",
  "branch": "Hyke",
  "assigned_date": "2026-04-21",
  "notes": "Focus on slide 5–8",
  "status": "Not Yet",
  "order": 0
}
```
Minimal valid body: `{ "title": "..." }` — everything else is optional.

### Mark a task done / not done
```
PATCH /tasks?id=eq.<uuid>
Body: { "status": "Done" }

PATCH /tasks?id=eq.<uuid>
Body: { "status": "Not Yet" }
```

### Reschedule a task
```
PATCH /tasks?id=eq.<uuid>
Body: { "assigned_date": "2026-04-22" }
```

### Move task to backlog
```
PATCH /tasks?id=eq.<uuid>
Body: { "assigned_date": null }
```

### Update notes
```
PATCH /tasks?id=eq.<uuid>
Body: { "notes": "Updated note here" }
```

### Bulk reschedule (e.g. move all today's undone tasks to tomorrow)
```
PATCH /tasks?assigned_date=eq.2026-04-21&status=eq.Not+Yet
Body: { "assigned_date": "2026-04-22" }
```

### Bulk mark done
```
PATCH /tasks?id=in.(<uuid1>,<uuid2>,<uuid3>)
Body: { "status": "Done" }
```

### Delete a task
```
DELETE /tasks?id=eq.<uuid>
```

---

## Branches

Branches are separate records. Sylvie can read them to know what branches exist.

### List branches
```
GET /branches?select=*&order=created_at.asc
```

Response shape:
```json
[
  { "id": "...", "name": "Hyke", "color": "#3b82f6" },
  { "id": "...", "name": "Thesis", "color": "#8b5cf6" }
]
```

---

## Rules Sylvie Should Follow

- Always use today's date in `YYYY-MM-DD` format when filtering or assigning dates
- Default `status` to `Not Yet` on creation; never set it to anything other than `Not Yet` or `Done`
- Default `order` to `0` for new tasks unless positioning them explicitly
- When moving tasks to a new day, use `PATCH` with `assigned_date`
- To move a task to backlog, set `assigned_date` to `null`
- Never delete tasks without confirming with the user first
- Tasks with `assigned_date: null` are in the backlog — not scheduled yet
- There is no priority, deadline, time block, or estimated time — keep it simple
