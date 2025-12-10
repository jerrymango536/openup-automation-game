# OpenUp Automation Ideation Game

A collaborative web app where teams brainstorm automation ideas and watch AI categorize them in real-time. Perfect for workshops, energizers, and AI-first transformation sessions.

## Features

- **Real-time collaboration**: Multiple participants can submit ideas simultaneously
- **AI-powered categorization**: Gemini Flash analyzes each idea and places it in the appropriate category
- **Live kanban board**: Watch ideas flow from "Analyzing" to their final category
- **Session-based**: Create sessions with unique codes for each workshop
- **Mobile-friendly**: Participants join on their phones, host displays on big screen

## Categories

Ideas are automatically categorized into:

- 🚀 **Quick Wins** - Automate this tomorrow (no-code tools, simple scripts)
- ⚡ **Achievable** - Worth the investment (moderate development effort)
- 🌙 **Moonshots** - Dream big, plan carefully (complex, experimental)

## Setup

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the contents of `supabase-schema.sql`
3. Enable Realtime:
   - Go to Database → Replication
   - Enable the `ideas` table for realtime

### 2. Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key

### 3. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the App

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How to Use

### As a Host (Facilitator)

1. Click "Start a Session"
2. Enter a session name (e.g., "Q1 Automation Ideas")
3. Display the host dashboard on a big screen
4. Share the QR code or room code with participants

### As a Participant

1. Click "Join a Session" or scan the QR code
2. Enter the 6-character room code
3. Optionally enter your name
4. Submit automation ideas!
5. Watch as AI categorizes your ideas

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL + Realtime)
- **AI**: Google Gemini Flash

## Project Structure

```
app/
├── page.tsx                    # Home (create/join session)
├── session/[code]/
│   ├── page.tsx               # Participant view
│   └── host/page.tsx          # Host dashboard with kanban
├── api/
│   ├── session/route.ts       # Create/get sessions
│   ├── idea/route.ts          # Submit ideas
│   └── analyze/route.ts       # Manual AI analysis
components/
├── KanbanBoard.tsx            # Main board display
├── IdeaCard.tsx               # Individual idea card
├── IdeaInput.tsx              # Idea submission form
└── SessionCode.tsx            # QR code + room code display
lib/
├── supabase.ts                # Supabase client + operations
├── gemini.ts                  # Gemini AI integration
└── types.ts                   # TypeScript types
```

## License

Built by OpenUp for AI-First Transformation workshops.
