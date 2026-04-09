# API Design

## Primary Access Method
Supabase auto-generated REST API via `@supabase/supabase-js` client for the frontend.

Base URL format: `https://<project-ref>.supabase.co/rest/v1/tasks`

Auth header for Sylvie (service role): `Authorization: Bearer <SERVICE_ROLE_KEY>`

## Supabase REST Patterns

### List tasks with filters
```
GET /rest/v1/tasks?branch=eq.Hyke&status=eq.Not+Yet&order=order.asc,created_at.desc
GET /rest/v1/tasks?assigned_date=eq.2026-04-09
GET /rest/v1/tasks?assigned_date=gte.2026-04-07&assigned_date=lte.2026-04-13
GET /rest/v1/tasks?priority=lte.2  (priority 1 or 2)
GET /rest/v1/tasks?title=ilike.*keyword*  (search)
```

### Create task
```
POST /rest/v1/tasks
Content-Type: application/json
{ "title": "...", "branch": "Hyke", "priority": 2, "status": "Not Yet", ... }
```

### Update task
```
PATCH /rest/v1/tasks?id=eq.<uuid>
Content-Type: application/json
{ "status": "Done" }
```

### Delete task
```
DELETE /rest/v1/tasks?id=eq.<uuid>
```

### Quick status toggle
```
PATCH /rest/v1/tasks?id=eq.<uuid>
{ "status": "Ongoing" }
```

### Bulk assign date
```
PATCH /rest/v1/tasks?id=in.(<uuid1>,<uuid2>)
{ "assigned_date": "2026-04-10" }
```

## Edge Functions (Optional — only if complex logic needed)

| Endpoint | Purpose |
|----------|---------|
| GET /functions/v1/tasks/summary | Daily/weekly summary: total hours per day, counts per status, overdue count |
| POST /functions/v1/tasks/bulk-update | Bulk update multiple tasks atomically |

### Summary Response Shape
```json
{
  "date": "2026-04-09",
  "total_estimated_hours": 8.5,
  "overcommitted": false,
  "counts": {
    "not_yet": 3,
    "ongoing": 2,
    "done": 5
  },
  "by_branch": {
    "Hyke": { "not_yet": 1, "ongoing": 1, "done": 2 }
  },
  "overdue_count": 1
}
```

## Notes
- Supabase service role key bypasses RLS → used by Sylvie only, never expose to browser
- All operations are clean JSON in/out
- No special endpoints needed for AI — standard REST works
