# GenShield

### Semantic protection for AI-generated responses

GenShield is a full-stack AI security platform that detects and prevents the exposure of protected company information in LLM-generated responses. It provides a transparent risk decision for every response and preserves the evidence needed for security review.

## Overview

GenShield is designed to protect organizations using generative AI. Instead of relying only on exact keyword matches, it evaluates the meaning and factual content of a response against protected company knowledge.

### Key Capabilities

- Semantic similarity analysis for paraphrased or meaning-level leaks
- Factual overlap detection for names, dates, numbers, and business entities
- Explainable risk scoring with `ALLOW`, `WARN`, and `BLOCK` outcomes
- Source lineage showing which protected document or fact triggered a decision
- Audit history for monitoring and reviewing detection activity

## How It Works

1. Protected documents and facts are stored in the system.
2. A user submits a prompt and receives an AI-generated response.
3. GenShield compares the response with the protected knowledge base.
4. Similarity, factual overlap, sensitivity, and risk signals are evaluated.
5. The policy engine returns `ALLOW`, `WARN`, or `BLOCK`.
6. The decision, supporting evidence, and source lineage are recorded.

```text
User prompt -> LLM response -> Security analysis -> Risk decision
				      |               |
			 Protected knowledge       ALLOW / WARN / BLOCK
				      |
			      Audit and lineage
```

## Technology

- **Frontend:** React, TypeScript, Vite, and Tailwind CSS
- **Backend:** FastAPI, Python, SQLAlchemy, and PostgreSQL
- **Security:** JWT authentication and Argon2 password hashing
- **Analysis:** Sentence-transformer embeddings and deterministic risk rules

## Running the Project

### Prerequisites

- Python 3.11 or later
- Node.js 18 or later
- PostgreSQL running locally or through the repository's Compose configuration

### 1. Start the Backend

Configure the backend environment using `backend/.env.example`, then run:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
python run.py
```

The API runs at `http://localhost:8000`. API documentation is available at `http://localhost:8000/docs`.

### 2. Start the Frontend

Open a second terminal and run:

```powershell
cd frontend
npm install
npm run dev
```

The web application runs at `http://localhost:5173`. Set `VITE_API_BASE_URL=http://localhost:8000` in `frontend/.env` if the API URL is not already configured.

## Project Goal

GenShield makes AI data protection practical by combining automated detection, explainable decisions, and traceable security records in one platform.
