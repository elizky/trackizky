# Trackizky

Daily activity tracking app. Personal use.

## Stack

- Next.js 15 (App Router)
- Supabase (PostgreSQL)
- Tailwind CSS
- PWA

## Features

- [x] Register yesterday's activities
- [x] View activity history
- [x] PWA installable (iOS/Android)
- [x] Mobile-first UI

## Database Schema

```
activities (id, label, category)
    ↑
day_log_activities (id, day_log_id, activity_id)
    ↓
day_logs (id, date, created_at)
```

## Setup

```bash
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_key
```

```bash
npm run dev
```

## Pending

- [ ] Calendar / heatmap view
- [ ] Activity frequency chart
- [ ] Current streak calculation
- [ ] Max streak calculation
- [ ] Last registered date per activity
