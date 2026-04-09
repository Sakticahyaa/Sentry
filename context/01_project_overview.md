# Project Overview

## Name
**Hyke Todo** — custom to-do list web app.

## Who Uses It
A **CEO/PM** managing tasks across multiple business branches. Uses it daily, often on mobile.
An **AI assistant named Sylvie** also accesses it via REST API for task management.

## Business Branches
| Branch | Color | Notes |
|--------|-------|-------|
| Meroket | #E74C3C (Red/Tomato) | |
| Thesis | #F1C40F (Yellow/Banana) | |
| Yutaka | #1ABC9C (Teal/Peacock) | Under ArachnoVa |
| Roetix | #8E44AD (Purple/Grape) | |
| Batin | #1ABC9C (Teal/Peacock) | Under ArachnoVa, same color as Yutaka |
| Hyke | #3498DB (Blue/Lavender) | |

Branches can be added or deleted. When a branch is deleted, its tasks have no branch assigned.

## Core Goals
1. Fast, minimal task management for a busy executive
2. Daily planning with time blocks (morning/afternoon/evening quarters)
3. Overcommitment detection (warn if day exceeds 12 hours estimated)
4. Mobile-responsive (CEO often on phone)
5. AI assistant (Sylvie) can read/write via Supabase service role REST API

## Non-Goals
- Not a complex project management suite
- Don't over-engineer — ship fast, iterate later
- No complex auth flows (single-user app, potential future team expansion)

## Language Note
UI labels/comments may use **Indonesian** where appropriate (user is Indonesian).
