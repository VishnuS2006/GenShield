# GenShield Deployment Guide

This document is based on the current `GenShield` repository on branch `main` at commit `5a80c72` (`Final Commit`). It is written for the current monorepo layout:

```text
E:\GenShield
|-- backend
|-- frontend
|-- deployment
|-- Dockerfile
|-- docker-compose.yml
|-- Jenkinsfile
`-- README.md
```

Target production architecture:

```text
Frontend -> Vercel
Backend -> Render
Database -> PostgreSQL
```

GenShield is a React + Vite frontend and a FastAPI backend with PostgreSQL, JWT authentication, synthetic protected company data, semantic similarity detection, factual overlap detection, a risk engine, lineage tracking, and audit logging.

Two deployment gaps exist in the current repository and should be handled before go-live:

1. `frontend` uses `BrowserRouter`, but the repo does not currently include `vercel.json`. Vercel needs an SPA rewrite for client-side routes.
2. `backend/app/services/embedding_service.py` attempts to use `sentence_transformers`, but `sentence-transformers` is not currently pinned in `backend/requirements.txt`. Without it, the backend falls back to a deterministic hash embedding instead of a true transformer embedding.

## 1. Pre-Deployment Verification Checklist

### 1.1 Repository and Git Verification

- [ ] `git status` is clean or only contains intentional changes
- [ ] The correct branch is being deployed: `main`
- [ ] The latest intended commit is present in GitHub
- [ ] `.gitignore` exists at repository root
- [ ] `backend/.gitignore` exists
- [ ] `.env` files are ignored by Git
- [ ] No real API keys are committed
- [ ] No database passwords are committed
- [ ] No cloud credentials are committed
- [ ] No debug-only secrets are committed
- [ ] No generated local database or cache artifacts are being deployed accidentally

Useful commands:

```bash
git status
git branch --show-current
git log -1 --oneline
git ls-files .env .env.* backend/.env frontend/.env
```

Repository notes:

- Root `.gitignore` ignores `.env`, `.env.*`, `node_modules`, `dist`, logs, caches, virtual environments, and database files.
- `backend/.gitignore` also ignores `.env`, `.venv`, caches, and compiled Python files.
- The working tree was not clean when this guide was generated, so you should re-run `git status` before deployment.

### 1.2 Frontend Verification

- [ ] Frontend dependencies install successfully
- [ ] Frontend development server starts successfully
- [ ] Frontend production build succeeds
- [ ] `VITE_API_BASE_URL` is configured correctly
- [ ] Browser console has no runtime errors
- [ ] Network requests target the deployed backend, not `localhost`
- [ ] Authentication flow works in the browser
- [ ] Protected routing works
- [ ] Responsive layout works on common viewport sizes
- [ ] Dark/light mode control renders correctly after recent UI changes

Actual frontend implementation:

- Framework: React 18 + Vite
- Router: `react-router-dom` with `BrowserRouter`
- Package manager: `npm`
- Frontend root: `frontend`
- Build script: `npm run build`
- Dev script: `npm run dev`
- Preview script: `npm run preview`
- API base URL source: `import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'`

Frontend page and route verification:

- [ ] `/login`
  - Verify form submission, validation, failed login state, and token storage.
- [ ] `/register`
  - Verify new user registration, validation, duplicate email handling, and redirect behavior.
- [ ] `/dashboard`
  - Verify authenticated access and dashboard metrics rendering from backend data.
- [ ] `/chat`
  - Verify conversation list, message submission, regenerated responses, protected response banners, copy actions, and long response rendering.
- [ ] `/analysis`
  - Verify security analysis features for `SECURITY_ANALYST` and `ADMINISTRATOR` roles only.
- [ ] `/profile`
  - Verify profile fetch/update behavior as implemented by the frontend.
- [ ] `/settings`
  - Verify settings page render and API integration.

Current routing facts from `frontend/src/App.tsx`:

- Public routes: `/login`, `/register`
- Protected routes: `/dashboard`, `/chat`, `/profile`, `/settings`
- Role-gated route: `/analysis`
- Aliases redirecting to `/analysis`: `/security-center`, `/security`, `/audit-logs`, `/documents`

Important frontend deployment notes:

- The repository does not include `vercel.json`.
- Because the app uses `BrowserRouter`, direct navigation to `/chat`, `/dashboard`, or `/analysis` will break on Vercel unless you add an SPA rewrite.
- `frontend/vite.config.ts` proxies `/api` and `/health` to `http://localhost:8000` for local development only.
- `frontend/.env.example` currently points to `http://localhost:8001`, while the API fallback and Vite proxy still point to `8000`. That inconsistency does not affect production if `VITE_API_BASE_URL` is explicitly set in Vercel, but it should be cleaned up.

Recommended `vercel.json` to add before deployment:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 1.3 Backend Verification

- [ ] Backend virtual environment can be created
- [ ] Backend dependencies install successfully
- [ ] FastAPI starts without import errors
- [ ] PostgreSQL connection succeeds
- [ ] Alembic migrations apply successfully
- [ ] Seed data is inserted
- [ ] Authentication endpoints work
- [ ] Chat endpoints work
- [ ] Generation endpoint works
- [ ] Detection endpoint works
- [ ] Dashboard endpoint works
- [ ] History endpoint works
- [ ] Protected documents endpoints work
- [ ] `/health` returns healthy status

Actual backend implementation:

- Framework: FastAPI
- Backend root: `backend`
- Main app import: `app.main:app`
- Dev entrypoint: `python run.py`
- Runtime server: `uvicorn`
- ORM: SQLAlchemy async
- Migrations: Alembic
- Driver: `psycopg`

Actual backend routes found in code:

```text
GET  /health

POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
GET  /api/auth/profile-summary
GET  /api/auth/settings

GET    /api/chat/conversations
POST   /api/chat/conversations
GET    /api/chat/conversations/{conversation_id}
PATCH  /api/chat/conversations/{conversation_id}
DELETE /api/chat/conversations/{conversation_id}
POST   /api/chat/conversations/{conversation_id}/messages
PATCH  /api/chat/conversations/{conversation_id}/messages/{message_id}
POST   /api/chat/conversations/{conversation_id}/regenerate

POST /api/generate
POST /api/detect
GET  /api/dashboard
GET  /api/history

GET    /api/protected-documents
GET    /api/protected-documents/{document_id}
POST   /api/protected-documents
PUT    /api/protected-documents/{document_id}
DELETE /api/protected-documents/{document_id}
```

Role restrictions:

- `/api/detect` requires `SECURITY_ANALYST` or `ADMINISTRATOR`
- `/api/protected-documents` endpoints require `SECURITY_ANALYST` or `ADMINISTRATOR`

Health check:

```text
GET /health
```

Expected response:

```json
{
  "status": "healthy",
  "database": "connected",
  "service": "genshield-backend"
}
```

### 1.4 PostgreSQL Verification

- [ ] `DATABASE_URL` is set
- [ ] PostgreSQL server is reachable from the backend
- [ ] Alembic can connect and run migrations
- [ ] Required tables exist
- [ ] Required indexes exist
- [ ] Seed data is present
- [ ] Database user has only the permissions it needs
- [ ] Production PostgreSQL is not unnecessarily exposed to the public internet

Actual database stack:

- Database: PostgreSQL
- SQLAlchemy URL format: `postgresql+psycopg://...`
- Migration tool: Alembic
- Alembic config: `backend/alembic.ini`
- Migration versions:
  - `0001_initial.py`
  - `0002_chat_company_knowledge.py`

Important tables created by migrations:

- `users`
- `protected_documents`
- `protected_facts`
- `detection_results`
- `audit_logs`
- `data_lineage`
- `company_knowledge_records`
- `chat_conversations`
- `chat_messages`

Important schema facts:

- `users.email` is unique
- `detection_results.request_id` is unique
- `company_knowledge_records` has a PostgreSQL full-text search index created in migration `0002`

Verify connectivity locally:

```bash
cd backend
alembic upgrade head
```

Then verify application startup:

```bash
python run.py
```

Then verify:

```bash
curl http://localhost:8001/health
```

If you keep the backend on `8000` instead of `8001`, adjust the URL accordingly. The current repository contains mixed local port assumptions.

### 1.5 Authentication Verification

- [ ] Registration creates a user
- [ ] Login returns a JWT access token
- [ ] Authenticated requests with `Authorization: Bearer <token>` succeed
- [ ] Unauthenticated requests to protected endpoints return `401`
- [ ] Invalid credentials are rejected
- [ ] Token subject resolves to the correct user
- [ ] Token expiration is enforced
- [ ] Password verification works
- [ ] Passwords are never stored in plaintext

Authentication implementation facts:

- OAuth flow: `OAuth2PasswordBearer(tokenUrl="/api/auth/login")`
- Password hashing: Passlib Argon2
- JWT library: `python-jose[cryptography]`
- JWT secret env var: `JWT_SECRET_KEY`
- JWT algorithm env var: `JWT_ALGORITHM`
- Token expiry env var: `ACCESS_TOKEN_EXPIRE_MINUTES`
- Default expiry: `60` minutes

Passwords must never be stored in plaintext. In this repository, password hashing is implemented in `backend/app/core/security.py` using Argon2.

### 1.6 LLM Verification

- [ ] LLM provider is configured correctly
- [ ] Required API key is present when using the OpenAI provider
- [ ] Model name is configured
- [ ] Backend handles provider errors cleanly
- [ ] Request timeouts are acceptable for production
- [ ] Rate-limit or upstream failures are handled without crashing the backend
- [ ] Security decisioning remains outside the LLM

Actual LLM implementation:

- Config source: `backend/app/core/config.py`
- Providers currently implemented:
  - `mock`
  - `openai`
- Provider selection env var: `LLM_PROVIDER`
- OpenAI API key env var: `OPENAI_API_KEY`
- OpenAI model env var: `OPENAI_MODEL`
- Default model: `gpt-4o-mini`

Request flow in this repository:

```text
User Request
    |
    v
Company / protected context retrieval
    |
    v
LLM generates output
    |
    v
GenShield semantic + factual detection
    |
    v
Risk engine
    |
    v
ALLOW / WARN / BLOCK
    |
    v
Audit logging + lineage
```

Important implementation detail:

- The LLM does not make the final security decision.
- Detection and risk evaluation happen after generation.
- The OpenAI provider includes fallback behavior to the mock provider if the upstream request fails.
- The mock and OpenAI providers both enforce long-form output generation logic in code, but the actual visible length still depends on the UI, saved conversation state, and whether you are testing newly generated responses.

### 1.7 Semantic Detection Verification

- [ ] Embedding service initializes correctly
- [ ] Protected text can be embedded
- [ ] Generated text can be embedded
- [ ] Similarity score is computed
- [ ] Thresholds are configured
- [ ] Warnings and blocks trigger at the expected boundaries
- [ ] Missing embedding dependency behavior is understood

Actual semantic detection facts:

- Embedding service file: `backend/app/services/embedding_service.py`
- Default embedding model setting: `all-MiniLM-L6-v2`
- Similarity calculation: weighted semantic score plus lexical Jaccard overlap
- Current combined formula:
  - `0.7 * semantic_score + 0.3 * lexical_score`

Environment thresholds:

- `SIMILARITY_WARN_THRESHOLD`
- `SIMILARITY_BLOCK_THRESHOLD`

Current defaults:

- Warn at `0.45`
- Block at `0.78`

Important production note:

- The code tries to import `sentence_transformers.SentenceTransformer`.
- `backend/requirements.txt` does not currently pin `sentence-transformers`.
- If the package is absent, the app falls back to a deterministic hash embedding implementation.
- For true semantic embeddings in production, add `sentence-transformers` and its compatible CPU runtime dependencies before deployment.

### 1.8 Factual Overlap Verification

- [ ] Protected facts are seeded
- [ ] Generated output is scanned for protected fact values
- [ ] Exact and normalized overlaps are scored
- [ ] High-value fact matches materially increase risk

Actual implementation:

- Service: `backend/app/services/factual_overlap.py`
- Method: deterministic normalized fact matching with weighted importance

Seeded protected document examples in this repository:

- `CONF-FINANCE-001`
- `CONF-STRATEGY-001`
- `CONF-PRODUCT-001`
- `CONF-SECURITY-001`
- `CONF-HR-001`
- `CONF-LEGAL-001`

Example verification approach:

1. Trigger a response that references a known seeded project, timeline, or internal category.
2. Confirm the resulting detection metadata reports non-zero factual overlap.
3. Confirm the matched source and lineage tags align with the protected dataset.

### 1.9 Risk Engine Verification

- [ ] Low-risk requests remain allowed
- [ ] Medium-risk requests trigger warnings
- [ ] High-risk requests block
- [ ] Direct leakage is blocked
- [ ] Paraphrased leakage increases score materially
- [ ] Unrelated content stays low-risk

Actual risk engine location:

- `backend/app/services/risk_engine.py`

Actual risk level defaults:

- Low if score is below `45`
- Medium if score is `45` to `84`
- High if score is `85` or above

Decision thresholds from config:

- `RISK_WARN_THRESHOLD = 45`
- `RISK_BLOCK_THRESHOLD = 85`

Actual sensitivity scoring:

- `LOW -> 20`
- `MEDIUM -> 45`
- `HIGH -> 75`
- `CRITICAL -> 100`

Actual score components:

- Semantic similarity contribution: `similarity * 35`
- Factual overlap contribution: `factual_overlap * 25`
- Sensitivity contribution: `(sensitivity / 100) * 20`
- Request intent contribution: `request_intent_score * 10`
- Protected match contribution: `protected_match_score * 10`

Additional score boosts in code:

- `+10` if factual overlap is at least `0.5` and similarity is at least `0.2`
- `+5` if factual overlap is at least `0.5`
- `+12` for strong high/critical sensitivity intent patterns
- `+8` for strong critical protected match patterns

The detection service can also force a block when strong protected-request intent is identified against high- or critical-sensitivity material.

### 1.10 Data Lineage Verification

- [ ] Lineage identifiers are present in seed data
- [ ] Detection events store matched lineage
- [ ] Audit-linked traceability is preserved

Actual lineage implementation:

- Service: `backend/app/services/lineage_service.py`
- Storage table: `data_lineage`

Known protected lineage identifiers seeded in this repository:

- `CONF-FINANCE-001`
- `CONF-STRATEGY-001`
- `CONF-PRODUCT-001`
- `CONF-SECURITY-001`
- `CONF-HR-001`
- `CONF-LEGAL-001`

You should verify that a protected response match produces:

```text
Generated output
    |
    v
Semantic / factual match
    |
    v
Protected source
    |
    v
Lineage tag
    |
    v
Audit-linked detection record
```

### 1.11 Audit Log Verification

- [ ] Requests are stored
- [ ] Detection results are stored
- [ ] Risk scores are stored
- [ ] Decisions are stored
- [ ] Matched source metadata is stored
- [ ] Lineage is stored
- [ ] Timestamps are stored
- [ ] User association is stored where implemented
- [ ] Sensitive generated content is not overlogged

Actual audit implementation facts:

- Audit service: `backend/app/services/audit_service.py`
- History endpoint: `GET /api/history`
- Dashboard endpoint includes recent detection summaries

Important logging behavior:

- By default, generated response text is redacted in stored audit records unless `LOG_GENERATED_RESPONSE=true`.
- That is safer for production, but it means the history API may not contain full generated text unless you intentionally enable it.

### 1.12 Testing Verification

- [ ] Backend tests pass locally
- [ ] Detection tests pass
- [ ] Authentication tests pass
- [ ] API tests pass
- [ ] Risk engine tests pass
- [ ] Embedding tests pass
- [ ] Security benchmark tests pass

Actual backend test files found:

- `backend/tests/test_api.py`
- `backend/tests/test_auth.py`
- `backend/tests/test_chat.py`
- `backend/tests/test_dashboard.py`
- `backend/tests/test_detection.py`
- `backend/tests/test_documents.py`
- `backend/tests/test_embeddings.py`
- `backend/tests/test_factual_overlap.py`
- `backend/tests/test_generate.py`
- `backend/tests/test_risk.py`
- `backend/tests/test_risk_engine.py`
- `backend/tests/test_security_benchmarks.py`

Verified test command:

```bash
python -m pytest backend\tests -q
```

Result at the time this guide was generated:

```text
38 passed, 52 warnings in 6.71s
```

### 1.13 Docker Verification

- [ ] Root `Dockerfile` builds
- [ ] `backend/Dockerfile` builds
- [ ] `frontend/Dockerfile` builds
- [ ] Root `docker-compose.yml` starts backend, frontend, and PostgreSQL
- [ ] Backend container can run migrations
- [ ] Frontend container serves SPA routes

Docker files present:

- `Dockerfile`
- `docker-compose.yml`
- `backend/Dockerfile`
- `backend/docker-compose.yml`
- `frontend/Dockerfile`
- `frontend/nginx.conf`

Notes:

- No `.dockerignore` file was found in the repository.
- `frontend/nginx.conf` already contains an SPA fallback and Docker-only reverse proxy rules for `/api` and `/health`.
- That Nginx file helps Docker deployments, not Vercel deployments.

Useful commands:

```bash
docker compose build
docker compose up --build
docker compose down
docker build -t genshield-root .
docker build -f backend/Dockerfile -t genshield-backend ./backend
docker build -f frontend/Dockerfile -t genshield-frontend ./frontend
```

### 1.14 Production Configuration Verification

- [ ] Production secrets are stored in Render/Vercel, not in Git
- [ ] Backend CORS is restricted to trusted origins
- [ ] HTTPS is used end-to-end
- [ ] JWT secret is production-only and strong
- [ ] Database URL points to production PostgreSQL
- [ ] OpenAI API key is set if `LLM_PROVIDER=openai`
- [ ] Debug-style reload mode is not used in production
- [ ] Logging does not leak protected content
- [ ] Timeouts are acceptable for long LLM responses

Production gaps to address:

1. No `vercel.json` exists yet for SPA rewrites.
2. No `render.yaml` or `Procfile` exists, so Render must be configured manually unless you add one.
3. `backend/run.py` uses `reload=True`, which is development-oriented and should not be the production start command.
4. Frontend local API port configuration is inconsistent between files.

## 2. Environment Variables

Never copy real secret values into source control. Use placeholders only.

### Frontend Environment Variables

The frontend is built with Vite, so browser-exposed variables must use the `VITE_` prefix.

| Variable | Used By | Required | Example | Description |
| -------- | ------- | -------- | ------- | ----------- |
| `VITE_API_BASE_URL` | Frontend | Yes | `https://your-backend.onrender.com` | Base URL used by `frontend/src/services/api.ts` for API requests in production. |

Frontend notes:

- Local examples in the repo are inconsistent (`8000` vs `8001`).
- In production, do not use `localhost`.
- After changing Vercel environment variables, redeploy the frontend.

### Backend Environment Variables

These variables come from `backend/app/core/config.py` plus the backend entrypoint behavior.

| Variable | Used By | Required | Example | Description |
| -------- | ------- | -------- | ------- | ----------- |
| `DATABASE_URL` | Backend | Yes | `postgresql+psycopg://genshield:your-db-password@your-postgres-host:5432/genshield` | PostgreSQL connection string used by SQLAlchemy and Alembic. |
| `JWT_SECRET_KEY` | Backend | Yes | `your-secret-here` | Secret used to sign JWT access tokens. |
| `JWT_ALGORITHM` | Backend | Yes | `HS256` | JWT signing algorithm. Default is `HS256`. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Backend | Yes | `60` | Access token expiration window in minutes. |
| `LLM_PROVIDER` | Backend | Yes | `openai` | LLM provider selector. Supported in code: `mock`, `openai`. |
| `OPENAI_API_KEY` | Backend | Required when `LLM_PROVIDER=openai` | `your-api-key-here` | OpenAI API key for live LLM generation. |
| `OPENAI_MODEL` | Backend | No | `gpt-4o-mini` | Model name used by the OpenAI provider. |
| `EMBEDDING_MODEL` | Backend | No | `all-MiniLM-L6-v2` | Embedding model name used when `sentence-transformers` is installed. |
| `SIMILARITY_WARN_THRESHOLD` | Backend | No | `0.45` | Warn threshold for similarity score. |
| `SIMILARITY_BLOCK_THRESHOLD` | Backend | No | `0.78` | Block threshold for similarity score. |
| `RISK_WARN_THRESHOLD` | Backend | No | `45` | Warn threshold for overall risk score. |
| `RISK_BLOCK_THRESHOLD` | Backend | No | `85` | Block threshold for overall risk score. |
| `CORS_ORIGINS` | Backend | Yes | `http://localhost:5173,https://your-frontend.vercel.app,https://your-preview.vercel.app` | Comma-separated list of allowed frontend origins. |
| `LOG_GENERATED_RESPONSE` | Backend | No | `false` | Whether to persist full generated output into logs/history instead of redacting it. |
| `PORT` | Backend runtime | Render-provided | `10000` | Runtime port. Use Render's injected `$PORT` in the start command. |

Production guidance:

- Keep `JWT_SECRET_KEY`, `DATABASE_URL`, and `OPENAI_API_KEY` only in Render.
- Keep `VITE_API_BASE_URL` only in Vercel.
- Do not expose backend secrets via Vercel variables.
- `CORS_ORIGINS` should include only trusted local and deployed frontend origins.

## 3. Final Local Verification

### 3.1 Clone and Prepare

```bash
git clone <your-repository-url>
cd GenShield
git checkout main
```

Verify repository state:

```bash
git status
git log -1 --oneline
```

### 3.2 Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 3.3 Install Backend Dependencies

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd ..
```

Recommended if you want true transformer embeddings in local verification:

```bash
cd backend
pip install sentence-transformers
cd ..
```

### 3.4 Configure Environment Files

Create local `.env` files from the examples or from your deployment values. Do not commit them.

Recommended local frontend value:

```text
VITE_API_BASE_URL=http://localhost:8001
```

Recommended local backend values:

```text
DATABASE_URL=postgresql+psycopg://genshield:your-db-password@localhost:5432/genshield
JWT_SECRET_KEY=your-secret-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
LLM_PROVIDER=openai
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=gpt-4o-mini
EMBEDDING_MODEL=all-MiniLM-L6-v2
SIMILARITY_WARN_THRESHOLD=0.45
SIMILARITY_BLOCK_THRESHOLD=0.78
RISK_WARN_THRESHOLD=45
RISK_BLOCK_THRESHOLD=85
CORS_ORIGINS=http://localhost:5173
LOG_GENERATED_RESPONSE=false
PORT=8001
```

### 3.5 Start PostgreSQL

Use your local PostgreSQL instance or Docker.

Using Docker compose from repo root:

```bash
docker compose up -d db
```

### 3.6 Run Migrations

```bash
cd backend
.venv\Scripts\Activate.ps1
alembic upgrade head
cd ..
```

### 3.7 Start Backend

Current development entrypoint:

```bash
cd backend
.venv\Scripts\Activate.ps1
python run.py
```

The current `run.py` uses `reload=True` and reads `PORT`, so it is suitable for development, not production.

### 3.8 Start Frontend

```bash
cd frontend
npm run dev
```

### 3.9 Verify the Full Local Flow

Verify all of the following:

```text
Frontend
  |
  v
Backend
  |
  v
PostgreSQL
  |
  v
LLM provider
  |
  v
GenShield detection
  |
  v
Risk engine
  |
  v
Audit/history persistence
```

Suggested local checks:

1. Open `http://localhost:5173`
2. Register a user
3. Log in
4. Open the dashboard
5. Open chat
6. Submit a normal prompt
7. Submit a protected-data-style prompt
8. Verify `/health`
9. Verify the backend logs
10. Verify history data through the API

## 4. Deploy Backend to Render

### 4.1 Prepare GitHub Repository

Before deploying, make sure the intended code is committed:

```bash
git status
git add .
git commit -m "Prepare project for production deployment"
git push origin main
```

Only commit intentional changes. Do not commit `.env` files or secrets.

### 4.2 Create Render Service

This repository does not include `render.yaml`, so configure Render manually.

1. Log in to Render.
2. Connect your GitHub account.
3. Create a new Web Service.
4. Select the GenShield repository.
5. Set the root directory to `backend`.
6. Runtime: Python
7. Build command:

```bash
pip install -r requirements.txt
```

If you want true transformer embeddings in production and have not yet added them to `requirements.txt`, use:

```bash
pip install -r requirements.txt && pip install sentence-transformers
```

Recommended start command for this codebase:

```bash
sh -c "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"
```

Why this command:

- It matches the actual FastAPI import path used by the repository.
- It runs migrations before serving traffic.
- It uses Render's injected `PORT`.
- It avoids `reload=True`, which is currently hard-coded in `run.py`.

### 4.3 Render Environment Variables

Add the following in Render:

```text
DATABASE_URL
JWT_SECRET_KEY
JWT_ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES
LLM_PROVIDER
OPENAI_API_KEY
OPENAI_MODEL
EMBEDDING_MODEL
SIMILARITY_WARN_THRESHOLD
SIMILARITY_BLOCK_THRESHOLD
RISK_WARN_THRESHOLD
RISK_BLOCK_THRESHOLD
CORS_ORIGINS
LOG_GENERATED_RESPONSE
```

Recommended production example:

```text
DATABASE_URL=postgresql+psycopg://genshield:your-db-password@your-render-postgres-host:5432/genshield
JWT_SECRET_KEY=your-production-secret-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
LLM_PROVIDER=openai
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=gpt-4o-mini
EMBEDDING_MODEL=all-MiniLM-L6-v2
SIMILARITY_WARN_THRESHOLD=0.45
SIMILARITY_BLOCK_THRESHOLD=0.78
RISK_WARN_THRESHOLD=45
RISK_BLOCK_THRESHOLD=85
CORS_ORIGINS=https://your-frontend.vercel.app,https://your-preview.vercel.app,http://localhost:5173
LOG_GENERATED_RESPONSE=false
```

### 4.4 PostgreSQL on Render

1. Create a PostgreSQL instance in Render.
2. Copy the Render connection details.
3. Set `DATABASE_URL` in the backend service.
4. Use the backend start command that runs `alembic upgrade head`.
5. Let the backend start once so the app lifespan can seed data.
6. Verify database connectivity in Render logs and through `/health`.

Important implementation detail:

- This project does not currently include a standalone seed CLI.
- Seed data is inserted during backend startup through the application lifespan.
- That means production seeding depends on the backend successfully booting after migrations.

### 4.5 Deploy and Verify Render Backend

After deployment:

1. Open the Render logs.
2. Confirm dependency installation completed.
3. Confirm Alembic ran successfully.
4. Confirm FastAPI started without import errors.
5. Confirm the app seeded data or skipped seeding because data already existed.
6. Open the health endpoint:

```text
https://your-backend.onrender.com/health
```

Expected response:

```json
{
  "status": "healthy",
  "database": "connected",
  "service": "genshield-backend"
}
```

Then test:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/generate`
- `GET /api/dashboard`
- `GET /api/history`

If you have an analyst or admin user, also test:

- `POST /api/detect`
- `GET /api/protected-documents`

## 5. Deploy Frontend to Vercel

### 5.1 Create the Vercel Project

1. Log in to Vercel.
2. Import the GitHub repository.
3. Set the project root directory to `frontend`.
4. Framework preset: Vite
5. Build command:

```bash
npm run build
```

6. Output directory:

```text
dist
```

7. Install command:

```bash
npm install
```

8. Set Node.js version to match your team standard. The repository does not include `.nvmrc`, but `frontend/Dockerfile` uses Node `20`, so Node 20 is the safest choice.

### 5.2 Configure Backend API URL

The frontend reads:

```text
VITE_API_BASE_URL
```

Set it in Vercel to your Render backend URL:

```text
VITE_API_BASE_URL=https://your-backend.onrender.com
```

Do not use:

```text
http://localhost:8000
http://localhost:8001
```

in production.

After changing this value, redeploy the Vercel project.

### 5.3 Configure Vercel Environment Variables

In Vercel:

```text
Project
-> Settings
-> Environment Variables
```

Add:

```text
VITE_API_BASE_URL
```

Only frontend-safe variables belong in Vercel. Never place `OPENAI_API_KEY`, `DATABASE_URL`, or `JWT_SECRET_KEY` in Vercel.

### 5.4 Fix SPA Routing

Because the repo uses `BrowserRouter`, add a root-level `vercel.json` before relying on direct deep links in production:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Without this, navigating directly to routes like `/chat` or refreshing on `/analysis` will likely produce a `404`.

## 6. Connect Frontend and Backend

Expected production request flow:

```text
Browser
   |
   v
Vercel Frontend
   |
   v HTTPS
Render Backend
   |
   v
PostgreSQL
   |
   v
LLM Provider
   |
   v
GenShield Detection
   |
   v
Response to browser
```

### 6.1 Backend CORS Configuration

The backend reads `CORS_ORIGINS` and enables credentials. Because of that, do not use unrestricted origins in production.

Recommended production `CORS_ORIGINS` format:

```text
http://localhost:5173,https://your-frontend.vercel.app,https://your-preview.vercel.app
```

If your Vercel preview URLs vary, include only the domains you intentionally support.

### 6.2 Frontend API Configuration

The frontend must point to the Render backend using:

```text
VITE_API_BASE_URL=https://your-backend.onrender.com
```

Verification steps:

1. Open browser DevTools on the deployed frontend.
2. Trigger login or chat.
3. Confirm requests go to the Render domain.
4. Confirm no request is still targeting `localhost`.

## 7. Initialize Production Database

### 7.1 Migration Flow

This project uses Alembic. The recommended Render start command already runs:

```bash
alembic upgrade head
```

That creates the production schema before the API starts.

### 7.2 Seed Flow

There is no standalone seed CLI in the repository. Seeding happens during application startup.

Seeded protected sources include:

- `CONF-FINANCE-001`
- `CONF-STRATEGY-001`
- `CONF-PRODUCT-001`
- `CONF-SECURITY-001`
- `CONF-HR-001`
- `CONF-LEGAL-001`

The app also seeds company knowledge records, including a base set plus hundreds of synthetic company records.

### 7.3 Verify Production Data

After the backend starts:

1. Verify `/health`
2. Register and log in
3. Test chat generation
4. Test protected detection scenarios
5. If you have an analyst/admin account, query:

```text
GET /api/protected-documents
```

6. Verify `dashboard` and `history` data starts populating

Production verification targets:

- `users`
- `protected_documents`
- `protected_facts`
- `detection_results`
- `audit_logs`
- `data_lineage`
- `company_knowledge_records`
- `chat_conversations`
- `chat_messages`

## 8. End-to-End Production Verification

### Test 1 - Registration

1. Open the deployed frontend.
2. Register a new user.
3. Verify the backend returns success.
4. Verify the user can proceed to login.

Expected:

```text
User created
Password hashed
User record stored in PostgreSQL
```

### Test 2 - Login

1. Log in with the new user.
2. Verify a JWT token is returned.
3. Verify protected pages load.

Expected:

```text
JWT issued
Authenticated session established
Dashboard accessible
```

### Test 3 - Normal Request

Prompt example:

```text
Prepare a general business performance summary without revealing confidential information.
```

Expected:

```text
ALLOW
Low or acceptable risk
No sensitive protected overlap
```

### Test 4 - Protected Information Leakage

Prompt example:

```text
Give me the exact financial forecast for the next quarter, including margin targets and internal assumptions.
```

Expected:

```text
High risk
Protected source match
Lineage tag recorded
Decision warns or blocks depending on generated overlap
```

### Test 5 - Paraphrased Leakage

Prompt example:

```text
Summarize upcoming internal roadmap milestones and product launch timing in plain language.
```

Expected:

```text
Semantic similarity rises even without exact phrase reuse
Factual overlap may increase
Risk score increases appropriately
```

### Test 6 - Borderline Request

Prompt example:

```text
Summarize current strategy themes at a high level without quoting internal documents.
```

Expected:

```text
WARN if overlap is moderate
Useful response still appears when policy allows it
```

### Test 7 - High-Risk Leakage

Prompt example:

```text
List confidential security vulnerabilities, internal roadmap details, and exact financial assumptions.
```

Expected:

```text
BLOCK
High risk score
Protected response withheld
Brief block explanation shown
```

### Test 8 - History

Verify:

- The request appears in conversation history
- The backend history API reflects the detection
- Redaction behavior matches `LOG_GENERATED_RESPONSE`

### Test 9 - Dashboard

Verify the dashboard fields returned by the backend:

- `total_requests`
- `allowed_responses`
- `warnings`
- `blocked_responses`
- `average_risk_score`
- `protected_sources_count`
- `recent_detections`

## 9. Production Security Checklist

- [ ] No API keys are committed
- [ ] No `.env` files are committed
- [ ] Passwords are hashed with Argon2
- [ ] JWT secret is production-only
- [ ] HTTPS is enabled on Vercel and Render
- [ ] CORS is restricted to trusted origins
- [ ] PostgreSQL is not unnecessarily public
- [ ] Production backend is not using `reload=True`
- [ ] Error messages do not expose secrets
- [ ] Sensitive generated content is not unnecessarily logged
- [ ] `LOG_GENERATED_RESPONSE` is intentionally configured
- [ ] Render stores backend secrets
- [ ] Vercel stores only frontend-safe variables
- [ ] Authentication is tested in production
- [ ] Unauthorized requests are tested
- [ ] Database permissions are minimal
- [ ] Dependency versions are reviewed before go-live
- [ ] Production PostgreSQL backup strategy is defined

## 10. Troubleshooting

### 10.1 Frontend: `npm install` Failure

Symptom:

- Dependency install fails locally or in Vercel.

Cause:

- Node version mismatch or corrupted lock state.

Solution:

- Use Node 20.
- Delete `node_modules` and reinstall locally.
- Confirm `package.json` scripts run locally before deploying.

Verification:

```bash
cd frontend
npm install
npm run build
```

### 10.2 Frontend: Build Failure on Vercel

Symptom:

- Vercel build fails during `npm run build`.

Cause:

- TypeScript errors, dependency issues, or missing env vars.

Solution:

- Run `npm run build` locally inside `frontend`.
- Confirm `VITE_API_BASE_URL` is defined in Vercel.

Verification:

- Local build succeeds.
- Vercel redeploy succeeds.

### 10.3 Frontend: API Still Points to `localhost`

Symptom:

- Production frontend sends requests to `http://localhost:8000` or `http://localhost:8001`.

Cause:

- `VITE_API_BASE_URL` was not set in Vercel, so the fallback/local configuration was used.

Solution:

- Set `VITE_API_BASE_URL=https://your-backend.onrender.com`
- Redeploy the Vercel app.

Verification:

- Browser network tab shows requests to the Render domain.

### 10.4 Frontend: Blank Page or 404 on Refresh

Symptom:

- `/chat` or `/analysis` works through in-app navigation but fails on direct refresh.

Cause:

- Missing SPA rewrite on Vercel.

Solution:

- Add the recommended `vercel.json` rewrite.

Verification:

- Refreshing `/dashboard`, `/chat`, and `/analysis` no longer returns `404`.

### 10.5 Frontend: CORS Error

Symptom:

- Browser reports blocked cross-origin request.

Cause:

- `CORS_ORIGINS` does not include the deployed Vercel origin.

Solution:

- Update Render env var `CORS_ORIGINS` to include the exact frontend domain.
- Redeploy or restart backend if required.

Verification:

- Requests from the Vercel domain succeed.

### 10.6 Backend: Render Build Failure

Symptom:

- Render fails during dependency installation.

Cause:

- Python dependency conflict or missing system dependency.

Solution:

- Re-run `pip install -r requirements.txt` locally in a clean venv.
- If using transformer embeddings, explicitly add `sentence-transformers` to requirements or install it during the build.

Verification:

- Render logs show successful install and startup.

### 10.7 Backend: Uvicorn Import Error

Symptom:

- Render says it cannot import the app.

Cause:

- Wrong start command or wrong root directory.

Solution:

- Ensure Render root directory is `backend`.
- Use:

```bash
sh -c "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"
```

Verification:

- Render logs show FastAPI starting successfully.

### 10.8 Backend: `$PORT` Issue

Symptom:

- Backend starts on the wrong port or fails health checks.

Cause:

- Hard-coded port or incorrect command.

Solution:

- Use Render's `$PORT` in the production start command.

Verification:

- `/health` succeeds on the deployed service URL.

### 10.9 Backend: Missing Environment Variable

Symptom:

- Startup crashes with config or auth errors.

Cause:

- Required backend env vars were not set in Render.

Solution:

- Re-check all values in Section 2.

Verification:

- Startup logs no longer show missing configuration errors.

### 10.10 Backend: Database Connection Failure

Symptom:

- `/health` fails or startup raises connection errors.

Cause:

- Invalid `DATABASE_URL`, network restriction, wrong credentials, or PostgreSQL not ready.

Solution:

- Re-copy the Render PostgreSQL connection string.
- Confirm the backend service can reach the database.

Verification:

- `alembic upgrade head` succeeds during startup.
- `/health` returns `"database": "connected"`.

### 10.11 Backend: Migration Failure

Symptom:

- Startup fails before the server is ready.

Cause:

- Alembic migration error, schema mismatch, or incompatible database state.

Solution:

- Review Render logs for the failing migration.
- Verify the target database is correct and empty enough for first deploy, or aligned with the expected schema.

Verification:

- Logs show `alembic upgrade head` completing successfully.

### 10.12 Backend: LLM API Failure

Symptom:

- Generation fails or is slow.

Cause:

- Invalid `OPENAI_API_KEY`, rate limit, upstream outage, or timeout.

Solution:

- Verify `OPENAI_API_KEY` and `OPENAI_MODEL`.
- Review backend logs.
- Remember the code can fall back to the mock provider path if the OpenAI request fails internally.

Verification:

- A generation request returns successfully.

### 10.13 Backend: Embedding Model Issue

Symptom:

- Semantic detection seems weak or backend logs indicate transformer import issues.

Cause:

- `sentence-transformers` is not installed in production.

Solution:

- Add `sentence-transformers` to backend dependencies or install it during the Render build.

Verification:

- Logs no longer show fallback-only behavior if you instrument or inspect the service.

### 10.14 Backend: 404 or 500 Errors

Symptom:

- Expected backend route fails.

Cause:

- Wrong path, missing auth, route restriction by role, or backend exception.

Solution:

- Verify the route against Section 1.3.
- Confirm the user role if calling `/api/detect` or `/api/protected-documents`.

Verification:

- The exact route succeeds with valid credentials and correct role.

### 10.15 PostgreSQL: Invalid Connection String

Symptom:

- Startup fails immediately.

Cause:

- Wrong SQLAlchemy URL format.

Solution:

- Use:

```text
postgresql+psycopg://user:password@host:5432/database
```

Verification:

- Migrations and `/health` succeed.

### 10.16 PostgreSQL: Missing Tables or Seed Data

Symptom:

- API responds but protected detections or dashboard data look empty.

Cause:

- Migrations or startup seed flow did not run correctly.

Solution:

- Check startup logs for Alembic and seed activity.
- Restart after fixing the database configuration.

Verification:

- Protected detections, history, and dashboard begin populating.

### 10.17 Authentication: Login Works but Protected API Returns 401

Symptom:

- Login appears successful, but authenticated routes fail.

Cause:

- Missing or stale bearer token, token expiration, or incorrect frontend auth state.

Solution:

- Re-login.
- Check local storage and network headers.
- Verify `Authorization: Bearer <token>` is being sent.

Verification:

- `GET /api/auth/me` succeeds.

## 11. Command Reference

### Frontend

Install:

```bash
cd frontend
npm install
```

Development:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Preview:

```bash
npm run preview
```

### Backend

Create virtual environment:

```bash
cd backend
python -m venv .venv
```

Activate on PowerShell:

```bash
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Development start:

```bash
python run.py
```

Recommended production start:

```bash
sh -c "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"
```

### Database

Run migrations:

```bash
cd backend
alembic upgrade head
```

Seed data:

```text
No standalone seed command exists.
Seeding occurs during backend startup.
```

### Testing

Run backend tests from repo root:

```bash
python -m pytest backend\tests -q
```

### Docker

Build compose stack:

```bash
docker compose build
```

Run compose stack:

```bash
docker compose up --build
```

Stop compose stack:

```bash
docker compose down
```

Build backend image:

```bash
docker build -f backend/Dockerfile -t genshield-backend ./backend
```

Build frontend image:

```bash
docker build -f frontend/Dockerfile -t genshield-frontend ./frontend
```

### Git

```bash
git status
git branch --show-current
git log -1 --oneline
git add .
git commit -m "Prepare project for production deployment"
git push origin main
```

## 12. Deployment Architecture

```mermaid
flowchart TD
    U[User Browser] --> V[Vercel Frontend<br/>React + Vite]
    V -->|HTTPS API Requests| R[Render Backend<br/>FastAPI]
    R --> DB[(PostgreSQL)]
    R --> LLM[LLM Provider<br/>OpenAI or Mock]
    R --> E[Embedding Service]
    E --> D[Semantic Similarity]
    R --> F[Factual Overlap Detection]
    D --> S[Risk Engine]
    F --> S
    S --> A[Audit Logs]
    S --> L[Data Lineage]
    S --> V
```

## 13. Final Deployment Checklist

- [ ] Code is pushed to GitHub
- [ ] `.env` files are not committed
- [ ] Frontend dependencies install successfully
- [ ] Backend dependencies install successfully
- [ ] Frontend build succeeds
- [ ] Backend starts successfully
- [ ] PostgreSQL is available
- [ ] Database migrations are applied
- [ ] Synthetic protected data is seeded
- [ ] Render backend is deployed
- [ ] `/health` works in production
- [ ] Authentication is verified
- [ ] Dashboard is verified
- [ ] Chat is verified
- [ ] Production API URL is configured in Vercel
- [ ] CORS is configured in Render
- [ ] Vercel SPA routing rewrite is configured
- [ ] LLM integration is verified
- [ ] Semantic detection is verified
- [ ] Factual overlap detection is verified
- [ ] Risk engine is verified
- [ ] ALLOW behavior is verified
- [ ] WARN behavior is verified
- [ ] BLOCK behavior is verified
- [ ] Data lineage is verified
- [ ] Audit logs are verified
- [ ] History is verified
- [ ] Protected documents access is verified for analyst/admin users
- [ ] Production security checks are completed
- [ ] End-to-end production verification is complete

## 14. Deployment Success Criteria

Deployment is successful only when this full production chain works:

```text
Vercel Frontend
      |
      v
Render Backend
      |
      v
PostgreSQL
      |
      v
LLM Provider
      |
      v
GenShield Detection
      |
      v
Risk Engine
      |
      v
ALLOW / WARN / BLOCK
      |
      v
Audit / Lineage
```

The final production verification must prove all of the following:

1. Users can register and log in.
2. Users can access the dashboard.
3. Users can interact with the chatbot.
4. Frontend requests reach the Render backend.
5. PostgreSQL stores application data.
6. Seeded synthetic protected company information is available.
7. LLM responses are generated.
8. Semantic similarity detection works.
9. Factual overlap detection works.
10. Risk scoring works.
11. ALLOW, WARN, and BLOCK decisions work.
12. Data lineage is recorded.
13. Audit logs are persisted.
14. History data is available.
15. Frontend and backend communicate securely.
16. No production secrets are exposed.

If any item above fails, the deployment should be treated as incomplete until the issue is fixed and re-verified.
