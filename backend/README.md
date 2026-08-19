# GenShield Backend

FastAPI backend for synthetic semantic data exfiltration detection. The service generates LLM responses from retrieved synthetic context, then independently performs deterministic similarity, factual-overlap, risk, lineage, and audit analysis before returning `ALLOW`, `WARN`, or `BLOCK`.

## Run locally

```bash
cd backend
python -m venv .venv
. .venv/Scripts/activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload
pytest
```

## Docker

```bash
cd backend
docker compose up --build
```

## Endpoints

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/protected-documents`
- `POST /api/generate`
- `POST /api/detect`
- `GET /api/dashboard`
- `GET /api/history`
