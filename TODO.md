This file is the practical run guide for the entire project.

## Option 1: Run Locally Without Docker

Use this option if you want the fastest developer setup.

### Prerequisites

- Python 3.12+ installed
- Node.js 20+ installed
- npm installed

### Step 1: Configure backend environment

Open `backend/.env` and make sure it contains working local values. A simple local setup is:

```env
DATABASE_URL=postgresql+psycopg://genshield:change-me@127.0.0.1:5432/genshield
JWT_SECRET_KEY=change-this-development-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
LLM_PROVIDER=mock
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
EMBEDDING_MODEL=all-MiniLM-L6-v2
SIMILARITY_WARN_THRESHOLD=0.60
SIMILARITY_BLOCK_THRESHOLD=0.85
RISK_WARN_THRESHOLD=60
RISK_BLOCK_THRESHOLD=90
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173
```

### Step 2: Configure frontend environment

Open `frontend/.env` and make sure it contains:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Step 3: Start backend

If you already have a local PostgreSQL server, make sure this database and user actually exist and match `backend/.env`.

If you do not want to configure PostgreSQL manually, start the repo PostgreSQL container first from the project root:

```bash
docker compose up db
```

That container uses:

```env
POSTGRES_DB=genshield
POSTGRES_USER=genshield
POSTGRES_PASSWORD=change-me
```

Then keep this value in `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg://genshield:change-me@localhost:5432/genshield
```

If your local PostgreSQL uses different credentials, change `DATABASE_URL` to match your real username, password, host, port, and database name.

After PostgreSQL is available, run:

```bash
cd backend
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```


Install packages:

```bash
pip install -r requirements-dev.txt
```

Run backend:

```bash
python run.py
```

Backend will start at:

- `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`

### Step 4: Start frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend will start at:

- `http://localhost:5173`

### Step 5: Use the application

1. Open `http://localhost:5173`
2. Register a new account
3. Log in
4. Go to `AI Chatbot`
5. Enter a prompt and generate a response
6. Review the risk score, similarity, facts matched, and decision
7. Open `Dashboard` to view metrics
8. Open `Audit Logs` to verify the request was recorded
9. Open `Protected Documents` to view the seeded synthetic documents

### Step 6: Run backend tests

```bash
cd backend
python -m pytest
```

### Step 7: Build frontend for production

```bash
cd frontend
npm run build
```

## Option 2: Run Entire Project With Docker

Use this option if you want the full multi-container stack.

### Prerequisites

- Docker Desktop installed
- Docker Compose available

### Step 1: Review root environment values

Use the root `.env.example` as the base reference. If you create a root `.env`, keep values consistent with your Docker setup.

Important values:

```env
POSTGRES_DB=genshield
POSTGRES_USER=genshield
POSTGRES_PASSWORD=change-me
DATABASE_URL=postgresql+psycopg://genshield:change-me@db:5432/genshield
JWT_SECRET_KEY=replace-with-a-long-random-secret
VITE_API_BASE_URL=http://localhost:8000
```

### Step 2: Build containers

From the project root:

```bash
docker compose build
```

### Step 3: Start containers

```bash
docker compose up
```

### Step 4: Open the running services

- Frontend: `http://localhost`
- Backend: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`

### Step 5: Stop containers

```bash
docker compose down
```

To also remove persistent database data:

```bash
docker compose down -v
```

## Recommended Complete Verification Flow

After starting the full project, test it in this order:

1. Check backend health at `http://localhost:8000/health`
2. Open frontend
3. Register a user
4. Log in
5. Open Dashboard
6. Open AI Chatbot and send a company question
7. Confirm a security decision appears
8. Open Audit Logs and confirm the request is recorded
9. Open Protected Documents and confirm seeded data exists
10. Run backend tests
11. Run frontend production build

## Common Commands

Backend:

```bash
cd backend
python -m pytest
python run.py
```

Frontend:

```bash
cd frontend
npm run dev
npm run build
```

Docker:

```bash
docker compose build
docker compose up
docker compose down
```

## Common Problems

### Backend does not start

Check:

- Python version
- virtual environment activation
- installed requirements
- `backend/.env` values

### Frontend cannot call backend

Check:

- backend is running on port `8000`
- `frontend/.env` points to `http://localhost:8000`
- CORS includes `http://localhost:5173`

### Docker does not work

Check:

- Docker Desktop is installed
- Docker engine is running
- ports `80` and `8000` are free

### Login fails

Check:

- backend is running
- registration completed successfully
- browser local storage is not stale from an older run

## Best Way To Run It

For development:

- run backend directly from `backend/`
- run frontend directly from `frontend/`

For demo or deployment-style testing:

- use `docker compose up`
