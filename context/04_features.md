# Features Specification

## 1. Task CRUD
- Create, Read, Update, Delete tasks
- All fields: id, title, branch, deadline, priority, status, notes, assigned_date, estimated_time, time_block, order, created_at, updated_at
- branch can be null (when branch is deleted, task remains branchless)

## 2. Views

### Daily View (PRIMARY — most used)
- Tasks grouped by `assigned_date` for a specific day
- Within each day, optionally group by `time_block`
- Shows total estimated hours, overcommitment warning if >12h

### Weekly View
- 7-day calendar layout
- Tasks spread across days
- Show total `estimated_time` per day column
- Overcommitment warning per day

### Board View (Kanban)
- Columns: Not Yet | Ongoing | Done
- Filterable by branch
- Drag task between columns → updates `status`

### Branch View
- All tasks for a specific branch
- Sorted by deadline

## 3. Filtering & Sorting
- Filter by: branch, status, assigned_date range, priority, time_block
- Sort by: deadline, priority, assigned_date, order (manual drag & drop)
- Search by title or notes (text search)

## 4. Drag & Drop
- Reorder tasks within a view → updates `order` field
- Move task between days → updates `assigned_date`
- Move task between Kanban columns → updates `status`
- Library: `@dnd-kit/core` (preferred) or `react-beautiful-dnd`

## 5. Quick Actions
- One-click status toggle: Not Yet → Ongoing → Done (cycles)
- Bulk actions:
  - Mark multiple tasks as Done
  - Assign date to multiple tasks at once

## 6. Daily Digest / Summary
- Total estimated hours per day
- Warning when total > 12 hours (overcommitment alert)
- Task count per status per branch

## 7. Analytics Dashboard (Simple)
- Completion rate per branch (% done)
- Tasks completed this week / this month
- Average time between assignment and completion
- Overdue tasks count (deadline passed, status != Done)

## 8. AI Integration (Sylvie)
- Sylvie accesses via Supabase REST API + service role key
- Operations: list tasks, create tasks, update status, assign dates, get summaries
- No special UI needed for this — it's API-only
- All CRUD must work purely via REST (not client-side only logic)
