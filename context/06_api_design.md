# API Design

## Primary Access Method
Supabase auto-generated REST API via `@supabase/supabase-js` client for the frontend.

Base URL: `https://xbzjykaayibfzzljfxeo.supabase.co/rest/v1`

Auth header for Sylvie (service role): `Authorization: Bearer <SERVICE_ROLE_KEY>`

## Task Schema

```ts
Task {
  id:            string   // UUID, auto
  title:         string   // required
  branch:        string | null
  status:        'Not Yet' | 'Done'
  notes:         string | null
  assigned_date: string | null  // 'YYYY-MM-DD', null = backlog
  order:         number
  created_at:    string
  updated_at:    string
}
```

Removed fields (no longer in DB or frontend): `priority`, `deadline`, `estimated_time`, `time_block`.

## Supabase REST Patterns

### List / filter tasks
```
GET /tasks?select=*&order=order.asc,created_at.desc
GET /tasks?select=*&assigned_date=eq.2026-04-21&order=order.asc
GET /tasks?select=*&assigned_date=is.null                          # backlog
GET /tasks?select=*&branch=eq.Hyke
GET /tasks?select=*&status=eq.Not+Yet
GET /tasks?select=*&title=ilike.*keyword*
```

### Create task
```
POST /tasks
Content-Type: application/json
Prefer: return=representation
{ "title": "...", "branch": "Hyke", "assigned_date": "2026-04-21", "status": "Not Yet", "order": 0 }
```

### Update task
```
PATCH /tasks?id=eq.<uuid>
Content-Type: application/json
{ "status": "Done" }
{ "assigned_date": "2026-04-22" }
{ "assigned_date": null }   # move to backlog
{ "notes": "..." }
```

### Bulk update
```
PATCH /tasks?id=in.(<uuid1>,<uuid2>)
{ "assigned_date": "2026-04-22" }

PATCH /tasks?assigned_date=eq.2026-04-21&status=eq.Not+Yet
{ "assigned_date": "2026-04-22" }
```

### Delete task
```
DELETE /tasks?id=eq.<uuid>
```

## Branch Schema

```ts
BranchRecord {
  id:         string
  name:       string
  color:      string  // hex color
  created_at: string
}
```

```
GET /branches?select=*&order=created_at.asc
POST /branches  { "name": "NewBranch", "color": "#hex" }
PATCH /branches?id=eq.<uuid>  { "name": "...", "color": "..." }
DELETE /branches?id=eq.<uuid>
```

## Notes
- Supabase service role key bypasses RLS — used by Sylvie only, never expose to browser
- All operations are clean JSON in/out
- No special endpoints needed for AI — standard REST works
