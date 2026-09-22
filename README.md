# Support Ticket Tracker

A small full-stack support ticket tracker: create tickets, list them, open details, update status, and filter by status. No authentication (out of scope for the assessment).

## Tech stack

| Layer    | Technology                                   |
| -------- | -------------------------------------------- |
| Frontend | React, TanStack Router, TanStack Query, Tailwind CSS |
| Backend  | FastAPI, Pydantic, SQLAlchemy                |
| Database | Supabase PostgreSQL                          |

## Architecture

```text
            React + TanStack
                   │
              REST (JSON)
                   ▼
                FastAPI
             routes → schemas → services
                   │
               SQLAlchemy
                   ▼
          Supabase PostgreSQL
               tickets
```

The browser only ever talks to FastAPI. No Supabase client runs in the frontend.

## Project structure

```text
src/                      # React frontend
├── api/tickets.ts        # fetch client for the REST API
├── hooks/useTickets.ts   # TanStack Query options + mutations
├── components/           # Badges, page shell
└── routes/               # / , /tickets/new , /tickets/$id

backend/
├── app/
│   ├── main.py           # FastAPI app + CORS
│   ├── database.py       # engine / session / dependency
│   ├── models/ticket.py  # SQLAlchemy model
│   ├── schemas/ticket.py # Pydantic validation
│   ├── routes/tickets.py # REST endpoints
│   └── services/ticket_service.py
└── requirements.txt

database/schema.sql       # Supabase table, constraints, trigger
```

## Setup

### 1. Database

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste the contents of `database/schema.sql`, and run it.
3. Copy the connection string from **Project Settings → Database → Connection string → URI**.

### 2. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                 # then paste your connection string
uvicorn app.main:app --reload --port 8000
```

Interactive API docs: <http://localhost:8000/docs>

### 3. Frontend

```bash
cp .env.example .env     # VITE_API_URL=http://localhost:8000
npm install
npm run dev
```

The app tells you clearly if the API is unreachable, so start the backend first.

## Environment variables

| File           | Variable                | Purpose                            |
| -------------- | ----------------------- | ---------------------------------- |
| `backend/.env` | `SUPABASE_DATABASE_URL` | Postgres connection string          |
| `backend/.env` | `CORS_ORIGINS`          | Allowed frontend origins            |
| `.env`         | `VITE_API_URL`          | Base URL of the FastAPI backend     |

No credentials are committed; only `.env.example` files are in the repository.

## API reference

| Method  | Path                 | Body                               | Notes                                |
| ------- | -------------------- | ---------------------------------- | ------------------------------------ |
| `GET`   | `/api/tickets`       | –                                  | Optional `?status=Open`              |
| `POST`  | `/api/tickets`       | `title, description, priority`     | Status defaults to `Open`, returns 201 |
| `GET`   | `/api/tickets/{id}`  | –                                  | 404 if not found                     |
| `PATCH` | `/api/tickets/{id}`  | `status`                           | Updates status and `updated_at`      |

Example:

```bash
curl -X POST http://localhost:8000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"title":"Login issue","description":"User cannot log in","priority":"High"}'
```

## Validation

Validated in both places, with the backend as the final authority:

- `title` — required, non-empty, max 200 characters
- `description` — required, non-empty
- `priority` — `Low` | `Medium` | `High`
- `status` — `Open` | `In Progress` | `Resolved`

Invalid requests return `422` with a readable message that the UI displays.

## Assumptions

- No authentication or user accounts, as stated in the assessment.
- A single `tickets` table; no comments, attachments or assignees.
- Only the status is editable after creation; title, description and priority are fixed.
- Tickets are listed newest first.
- The status filter is applied by the backend via `?status=` and mirrored in the frontend URL so filtered views are shareable.
- Row Level Security is enabled on the table, but the backend connects with the Postgres role directly, so the Supabase Data API is never used.
