# GenShield

GenShield is a full-stack AI security platform that detects whether LLM-generated responses leak protected synthetic company information. The backend makes the security decision deterministically using semantic similarity, factual overlap, sensitivity, risk scoring, and lineage tracing.

## Main Application Areas

- Dashboard
- AI Security Chatbot
- Security Analysis
- Profile
- Settings

## Core Features

- FastAPI backend with PostgreSQL persistence
- React + TypeScript frontend
- JWT authentication with Argon2 password hashing
- Deterministic `ALLOW` / `WARN` / `BLOCK` enforcement
- Semantic similarity with `all-MiniLM-L6-v2`
- Factual overlap detection against protected facts
- Audit logging and data lineage tracking

## Working API Endpoints

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/auth/profile-summary`
- `GET /api/auth/settings`
- `GET /api/dashboard`
- `GET /api/history`
- `GET /api/chat/conversations`
- `POST /api/chat/conversations`
- `GET /api/chat/conversations/{conversation_id}`
- `POST /api/chat/conversations/{conversation_id}/messages`
- `POST /api/generate`
- `POST /api/detect`
- `GET /api/protected-documents`

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements-dev.txt
python run.py
```

Backend URLs:

- API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

- App: `http://localhost:5173`

## Docker

From the repository root:

```bash
docker compose build
docker compose up -d
docker compose ps
docker compose logs -f
docker compose down
```

Status on August 19, 2026:

- `docker compose config` succeeded.
- `docker compose build` could not complete because the local Docker Desktop daemon was not running:
  `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`

## Testing

Backend:

```bash
cd backend
python -m pytest
```

Frontend:

```bash
cd frontend
npm run build
```

Verified on August 19, 2026:

- Backend tests: `29 passed`
- Frontend production build: passed

## Viewing PostgreSQL Records

Use actual local credentials from your root `.env` or `.env.example`. Do not hardcode secrets into the repo.

### Method 1 - PostgreSQL CLI through Docker

If PostgreSQL is running via Docker Compose:

```bash
docker compose exec db psql -U <POSTGRES_USER> -d <POSTGRES_DB>
```

Useful commands:

```sql
\dt
SELECT * FROM users;
SELECT * FROM protected_documents;
SELECT * FROM protected_facts;
SELECT * FROM detection_results;
SELECT * FROM audit_logs;
SELECT * FROM data_lineage;
SELECT * FROM detection_results LIMIT 20;
```

### Method 2 - pgAdmin / Database GUI

Use values from your local `.env` or `.env.example`:

- Host: `localhost`
- Port: `5432`
- Database: value of `POSTGRES_DB`
- Username: value of `POSTGRES_USER`
- Password: value of `POSTGRES_PASSWORD`

In pgAdmin:

1. Open `Servers`
2. Open your PostgreSQL server
3. Open `Databases`
4. Open the GenShield database
5. Open `Schemas`
6. Open `public`
7. Open `Tables`

Then inspect:

- `users`
- `protected_documents`
- `protected_facts`
- `detection_results`
- `audit_logs`
- `data_lineage`

## Environment Variables

Use `.env.example` as the template. Never commit real secrets.

Important values:

```env
POSTGRES_DB=genshield
POSTGRES_USER=genshield
POSTGRES_PASSWORD=change-me
DATABASE_URL=postgresql+psycopg://genshield:change-me@db:5432/genshield
JWT_SECRET_KEY=replace-with-a-long-random-secret
LLM_PROVIDER=mock
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
EMBEDDING_MODEL=all-MiniLM-L6-v2
SIMILARITY_WARN_THRESHOLD=0.60
SIMILARITY_BLOCK_THRESHOLD=0.85
RISK_WARN_THRESHOLD=60
RISK_BLOCK_THRESHOLD=90
VITE_API_BASE_URL=http://localhost:8000
```

## Notes

- The repo ignores `.env`, so local secrets are not tracked by Git.
- The frontend bundle currently emits a large-chunk warning during `vite build`; the build still succeeds.
- Browser-level end-to-end validation was not run in this terminal session.
