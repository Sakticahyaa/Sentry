# UI / UX Guidelines

## Design Principles
- Clean, minimal, modern
- Dark mode default (toggle to light available)
- Mobile-responsive — CEO often on phone
- Fast interactions — this is a productivity tool

## Color System

### Branch Colors
| Branch | Color Name | Hex |
|--------|-----------|-----|
| Meroket | Red/Tomato | #E74C3C |
| Thesis | Yellow/Banana | #F1C40F |
| Yutaka | Teal/Peacock | #1ABC9C |
| Roetix | Purple/Grape | #8E44AD |
| Batin | Teal/Peacock | #1ABC9C |
| Hyke | Blue/Lavender | #3498DB |

### Priority Indicators
| Priority | Label | Indicator |
|----------|-------|-----------|
| 1 | Critical | 🔴 |
| 2 | High | 🟠 |
| 3 | Medium | 🟡 |
| 4 | Low | 🔵 |
| 5 | Optional | ⚪ |

## Layout

### Sidebar
- Branch filters (click to filter)
- View switcher: Daily / Weekly / Board / Branch
- Quick Add button

### Header
- Current date display
- Search bar (title + notes)
- User menu (logout)
- Dark/light mode toggle

### Main Area
- Switches content based on active view

### Task Card (in all views)
- Title
- Branch badge (colored)
- Priority indicator
- Deadline (shows days remaining, highlights if overdue)
- Estimated time
- Time block label
- Quick actions: edit (opens modal/panel), delete, toggle status

## Interactions
- Click card → expand/edit (modal or slide-in panel)
- Inline editing for quick changes (title, status)
- Drag handle on card for reordering
- Smooth animations: drag & drop transitions, status change animations
- Overcommitment warning: visible alert/badge when daily total > 12h

## Language
- UI labels may use Indonesian (user is Indonesian)
- Example: "Belum" (Not Yet), "Sedang" (Ongoing), "Selesai" (Done) — or keep English if cleaner
