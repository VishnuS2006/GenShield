# GenShield

### Semantic protection for AI-generated responses

GenShield is a full-stack security platform that checks whether an LLM response reveals protected company information. It turns sensitive knowledge into an enforceable decision before the response reaches the user.

## Objective

Prevent semantic data exfiltration from generative AI systems while keeping every decision explainable, auditable, and traceable to its source.

## What Makes It Novel

GenShield does not rely on keyword blocking alone. It independently combines four signals:

| Signal | Purpose |
| --- | --- |
| Semantic similarity | Detects meaning-level matches, including paraphrases |
| Factual overlap | Finds protected names, numbers, dates, and entities |
| Risk scoring | Weighs sensitivity and evidence into a consistent result |
| Lineage tracing | Shows which protected document or fact supports the decision |

The policy engine returns a deterministic `ALLOW`, `WARN`, or `BLOCK` result. Detection results, audit events, and provenance are stored for later review in the security dashboard.

## How It Works

```text
Protected documents and facts
            |
            v
      User prompt -> LLM response
                           |
                           v
       Similarity + factual overlap + sensitivity
                           |
                           v
              Risk and policy decision
                 /        |        \
             ALLOW       WARN      BLOCK
                           |
                           v
              Audit log and data lineage
```

## Run With Docker

Requirements: Docker Desktop with Compose enabled.

```bash
docker compose up --build
```

Open the application at [http://localhost](http://localhost). The API is available at [http://localhost:8000/docs](http://localhost:8000/docs), and its health check is [http://localhost:8000/health](http://localhost:8000/health).

Stop the services with:

```bash
docker compose down
```

## Run Locally

Start the backend first. PostgreSQL must be available, and the backend environment should be configured from `backend/.env.example` into `backend/.env`.

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
python run.py
```

In a second terminal, start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173). Set `VITE_API_BASE_URL=http://localhost:8000` in `frontend/.env` when needed.

## Validate

```powershell
cd backend
python -m pytest

cd ..\frontend
npm run build
```

## Stack

FastAPI, PostgreSQL, SQLAlchemy, JWT and Argon2 on the backend; React, TypeScript, Vite, Tailwind CSS, Recharts, and Lucide React on the frontend.

Never commit real credentials. Use `backend/.env.example` and `frontend/.env.example` as the configuration templates.
