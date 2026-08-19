# GenShield

GenShield is a full-stack security application that detects whether an LLM-generated response semantically or factually leaks protected synthetic company information. It combines deterministic detection logic with explainable risk scoring, lineage tracing, and an operator-facing dashboard.

## Features

- JWT-based authentication with Argon2 password hashing
- React frontend for chatbot, security dashboards, audit logs, and protected documents
- FastAPI backend with authenticated APIs
- Synthetic protected document vault with fact extraction
- Deterministic detection pipeline:
  - semantic similarity
  - factual overlap
  - sensitivity-aware risk scoring
  - lineage tagging
- `ALLOW`, `WARN`, and `BLOCK` decisions
- Audit logging and dashboard metrics
- Docker, Jenkins, and EC2 deployment scaffolding

## Architecture

```text
User
  -> React Frontend
  -> FastAPI Backend
  -> Protected Document Retrieval
  -> LLM Provider / Mock Provider
  -> Detection Engine
      -> Semantic Similarity
      -> Factual Overlap
      -> Risk Engine
      -> Data Lineage
  -> Audit Log
  -> Dashboard / History / Security Analysis
```

## Tech Stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- Backend: FastAPI, SQLAlchemy, Pydantic
- Auth: JWT, Argon2
- Database: PostgreSQL for local development, testing, Docker, and production
- LLM: Mock provider by default, OpenAI-supported backend path
- CI/CD: Jenkins
- Deployment: Docker, Docker Compose, AWS EC2 / ECR

## Repository Structure

```text
GenShield/
├── backend/         FastAPI app, models, services, tests
├── frontend/        React app, routes, components, services
├── deployment/      Deployment helper scripts
├── database/        Database-related notes
├── data/            Synthetic and support data
├── docs/            Additional documentation
├── tests/           Reserved benchmark/test data folders
├── docker-compose.yml
├── Dockerfile
├── Jenkinsfile
├── README.md
└── TODO.md
```

## Core API Endpoints

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/generate`
- `POST /api/detect`
- `GET /api/dashboard`
- `GET /api/history`
- `GET /api/protected-documents`

## Environment Variables

Top-level `.env.example` includes the main deployment configuration. Important values:

```env
DATABASE_URL=
JWT_SECRET_KEY=
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
LLM_PROVIDER=mock
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
EMBEDDING_MODEL=all-MiniLM-L6-v2
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
VITE_API_BASE_URL=http://localhost:8000
```

For local development, the backend also reads `backend/.env` and the frontend reads `frontend/.env`.

## Run Locally Without Docker

### 1. Backend setup

```bash
cd backend
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

macOS/Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements-dev.txt
```

Start the backend:

```bash
python run.py
```

Backend URLs:

- API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`

### 2. Frontend setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

- App: `http://localhost:5173`

### 3. Use the app

1. Open `http://localhost:5173`
2. Register a new user
3. Log in
4. Open the AI Chatbot page
5. Submit a prompt
6. Review the generated response and security analysis
7. Check Dashboard, Audit Logs, and Protected Documents

## Run With Docker Compose

Prerequisites:

- Docker Desktop installed
- Docker Compose available

Steps:

```bash
docker compose build
docker compose up
```

Default service ports:

- Frontend: `http://localhost`
- Backend: `http://localhost:8000`
- PostgreSQL: internal container network only

To stop:

```bash
docker compose down
```

To remove volumes too:

```bash
docker compose down -v
```

## Testing

### Backend tests

```bash
cd backend
python -m pytest
```

The backend tests create a fresh temporary PostgreSQL cluster on Windows. Run them locally with PostgreSQL 17 installed at the path configured in `backend/tests/conftest.py`.

### Frontend production build

```bash
cd frontend
npm run build
```

## Authentication

- Users register with email, full name, and password
- Passwords are hashed with Argon2
- Backend returns JWT access tokens
- Frontend attaches the token to API requests

## Detection Logic

The backend does not trust the LLM to make the safety decision. GenShield itself calculates:

- semantic similarity between generated output and protected documents
- factual overlap between generated output and protected facts
- sensitivity contribution from the matched document
- final risk score and decision

Policy thresholds:

- `0-59` -> `ALLOW`
- `60-89` -> `WARN`
- `90-100` -> `BLOCK`

## CI/CD

The repository includes a Jenkins pipeline with stages for:

- checkout
- backend tests
- frontend build
- Docker build
- Docker push
- deploy

This pipeline still requires Jenkins credentials and an actual target environment.

## AWS Deployment Direction

The intended deployment path is:

```text
GitHub -> Jenkins -> Docker Build -> Amazon ECR -> Amazon EC2
```

Supporting AWS services:

- IAM
- CloudWatch
- Security Groups

## Known Limitations

- Docker runtime was not verified in the current environment because Docker CLI was not available
- Browser-based end-to-end validation was not executed in this session
- The frontend bundle is currently larger than ideal for production
- Token storage is still browser storage based, which is acceptable for development but not the strongest production posture

## Security Notes

- Use synthetic company data only
- Never commit real credentials
- Replace all placeholder secrets before deployment
- Restrict CORS in production
- Do not expose PostgreSQL publicly

## License

See [LICENSE](E:/GenShield/LICENSE:1).
