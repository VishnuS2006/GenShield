# GenShield

## Semantic Data Exfiltration Detection and Prevention System

GenShield is a planned enterprise security application for detecting and preventing confidential information from appearing in LLM-generated responses. The project is being developed in phases. This repository currently contains the initial production-style structure and documentation only; application features are not implemented yet.

## Project Overview

Large language models can receive protected company information as runtime context. A normal, legitimate user request may therefore cause the model to generate information that should not leave the protected environment. GenShield will inspect the generated response, assess its relationship to synthetic protected data, record the decision, and apply one of three policies: `ALLOW`, `WARN`, or `BLOCK`.

The project will use synthetic company data only. No real employee, customer, medical, financial, password, or confidential company information should be added.

## Problem Statement

Traditional data loss prevention (DLP) systems often focus on known strings, regular expressions, file patterns, or the user's input. Those techniques are useful for direct identifiers, but they can miss generated text that paraphrases, summarizes, reconstructs, or semantically describes protected facts. They also do not explain which protected source influenced the output.

The security target in GenShield is the generated response, not the prompt. The prompt may be harmless while the model's response contains sensitive information supplied through hidden or runtime context.

## GenShield Solution

GenShield will combine four signals:

1. **Semantic similarity**: compare the generated response with protected documents and facts using sentence embeddings and cosine similarity.
2. **Factual overlap**: identify protected entities, values, dates, relationships, and other facts that appear directly or indirectly in the response.
3. **Risk scoring**: combine similarity, factual overlap, sensitivity, confidence, and policy thresholds into an explainable risk score.
4. **Data lineage**: record which protected context, facts, model request, analysis signals, and policy decision contributed to the result.

The planned decision is `ALLOW`, `WARN`, or `BLOCK`.

## Core Innovation

GenShield treats LLM output as a data exfiltration surface. It is designed to detect meaning, not only exact strings, and to provide an audit-friendly explanation of how protected context was related to the generated output.

### Prompt Versus Generated Output

The user's prompt is not the primary security target. A legitimate prompt can cause an LLM to disclose protected runtime context. GenShield will therefore analyze the generated response after the LLM produces it and before the response is delivered to the user.

## System Architecture

Planned request flow:

```text
User
	-> React Frontend
	-> FastAPI Backend
	-> PostgreSQL
	-> Retrieve synthetic protected company context
	-> LLM provider
	-> Generated response
	-> GenShield detection engine
			 -> Semantic similarity
			 -> Factual overlap
			 -> Risk engine
			 -> Data lineage
	-> ALLOW / WARN / BLOCK
	-> PostgreSQL audit logs
```

The repository separates user interface, API, detection services, protected data, tests, documentation, and deployment assets so each area can be implemented and reviewed independently.

## Technology Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Python and FastAPI
- **Database**: PostgreSQL
- **Authentication**: JWT with Argon2 or bcrypt password hashing
- **LLM**: OpenAI, Gemini, or another accessible LLM API selected during implementation
- **Embeddings**: Sentence Transformers, `all-MiniLM-L6-v2`, and cosine similarity
- **Development and delivery**: Git, GitHub, Docker, Docker Compose, and Jenkins
- **AWS**: Amazon ECR, EC2, CloudWatch, and IAM

Provider choice, model configuration, and operational limits will be documented when those integrations are implemented.

## How Protected Context Reaches the LLM

In the planned flow, the backend will retrieve selected synthetic protected documents or facts from the protected data vault. That context will be assembled into the model request at runtime. The LLM will generate a response using both the user's prompt and that context. GenShield will inspect the generated response before returning it.

The protected context is a source for analysis and lineage. It is not permission for the model to disclose the information.

## Detection Model

### Semantic Similarity

The generated response and protected content will be converted into vector embeddings. Cosine similarity will estimate whether their meanings are close even when wording differs. High similarity is a signal, not an automatic decision; it must be interpreted with sensitivity and factual evidence.

### Factual Overlap

The factual analysis will look for protected names, projects, markets, dates, values, relationships, and reconstructed combinations. It will cover direct mentions and planned test cases for paraphrasing, summarization, obfuscation, and reconstruction.

### Risk Engine

The risk engine will combine the available detection signals into a transparent score and severity. The eventual scoring policy should make it possible to explain which signals raised risk and why a policy action was selected. Thresholds will be calibrated against the repository's normal, paraphrased, and borderline test sets.

### ALLOW / WARN / BLOCK Policy

| Decision | Planned meaning |
| --- | --- |
| `ALLOW` | The response has no material evidence of protected data leakage under the active policy. |
| `WARN` | The response has uncertain or moderate evidence and should be shown with an appropriate warning or review state. |
| `BLOCK` | The response has strong evidence of protected data leakage and should not be delivered as normal output. |

The exact thresholds and user experience will be defined during implementation and tested before being treated as production policy.

### Data Lineage

Each analysis should be able to connect the request to the selected protected context, generated response, embedding and factual signals, risk calculation, policy decision, and audit record. Lineage is intended to support incident review, debugging, policy tuning, and technical demonstrations without logging more sensitive content than necessary.

## Core Detection Example

**Protected information:**

```text
Project: Orion
Market: Enterprise
Launch: October
```

**User prompt:**

> Prepare an executive briefing about upcoming business developments.

**LLM output:**

> The company plans to introduce Orion to enterprise customers in October.

**GenShield analysis:**

- Semantic Similarity: High
- Protected Facts: Orion, Enterprise, October
- Sensitivity: HIGH
- Risk Score: High
- Decision: `BLOCK`

The prompt is legitimate. The generated output is the security target because it reveals facts supplied through protected context.

## Planned Application Screens

1. **Login**: authentication entry point.
2. **Dashboard**: high-level detection activity and policy outcomes.
3. **AI Agent Simulator**: controlled prompt and response-generation workflow.
4. **Security Analysis**: semantic, factual, risk, and lineage results for a response.
5. **Audit Logs**: searchable decisions and review information.

These screens are planned and are not implemented at this stage.

## Planned API Overview

The FastAPI layer is reserved for future endpoints covering authentication, dashboard metrics, agent simulation, response analysis, protected-context management, audit logs, and detection history. Endpoint contracts, authentication dependencies, schemas, and error behavior will be added in later phases.

## Planned Database Overview

PostgreSQL will eventually store application identities, protected synthetic documents and facts, analysis requests, detection signals, risk decisions, lineage records, and audit logs. Database migrations and seed data have reserved locations, but no schema has been created yet.

## Test Strategy

The eventual test suite will contain 20 cases:

- 10 normal outputs
- 5 paraphrased protected outputs
- 5 borderline cases

The target outcomes are:

- Detect at least 4 of 5 paraphrased protected cases.
- Keep the false-positive rate below 20 percent.
- Rank paraphrased protected content higher than unrelated content.
- Attempt to detect obfuscated and reconstructed information.

Test categories will include direct leakage, paraphrasing, summarization, obfuscation, reconstruction, normal output, and borderline output. Backend unit/API tests and broader integration cases have reserved locations.

## Docker Architecture

Docker and Docker Compose will eventually provide repeatable local and deployment environments for the frontend, FastAPI backend, and PostgreSQL dependencies. Container definitions are placeholders at this stage; no Docker commands or runtime configuration have been implemented.

## Jenkins CI/CD Flow

The intended delivery flow is:

```text
GitHub -> Jenkins -> Tests -> Docker build -> Amazon ECR -> AWS EC2 -> Docker container
```

The Jenkinsfile is reserved for a later phase. It will eventually define automated checks, image creation, registry publishing, and deployment controls.

## AWS Deployment Architecture

The planned AWS deployment uses Amazon ECR for container images and EC2 for a simple hosted runtime. CloudWatch will provide operational visibility, and IAM will restrict permissions. The AWS design should remain intentionally simple until the application requirements justify additional services.

## Enterprise Use Cases

- Reviewing whether an internal AI assistant disclosed protected roadmap information.
- Testing model behavior against a synthetic company data vault.
- Investigating why an output was allowed, warned, or blocked.
- Comparing exact leakage with paraphrased or reconstructed leakage.
- Demonstrating explainable AI security controls to auditors, engineers, or security teams.

## Development Workflow

1. Define a small slice of the product and its security behavior.
2. Add synthetic fixtures and the relevant contract or test.
3. Implement the slice in the reserved frontend, backend, database, or deployment area.
4. Run focused tests, then broader checks as the change expands.
5. Review auditability, sensitive logging, and security boundaries.
6. Integrate changes through GitHub and the future Jenkins pipeline.

This initial phase stops after structure and documentation. Feature implementation should begin only in a later, explicitly requested phase.

## Security Rules

- Use synthetic company data only.
- Never store plain-text passwords.
- Use Argon2 or bcrypt for password hashing.
- Use environment variables for secrets.
- Never commit API keys.
- Never commit AWS credentials.
- Never expose PostgreSQL publicly.
- Use minimum IAM permissions.
- Avoid unnecessary logging of sensitive generated content.
- Configure AWS billing alerts.
- Keep the AWS architecture simple.

These rules apply throughout development, testing, demos, and deployment.

## Project Folder Structure

```text
GenShield/
├── frontend/                 # React and TypeScript client
├── backend/                  # FastAPI application and backend tests
├── database/                 # Future migrations and synthetic seed data
├── data/                     # Protected documents, facts, and test cases
├── tests/                    # Cross-cutting test categories
├── deployment/               # Future AWS and deployment scripts
├── docs/                     # Architecture, API, and security documentation
├── .env.example              # Future environment variable reference
├── .gitignore
├── docker-compose.yml        # Future local orchestration
├── Dockerfile                # Future container definition
├── Jenkinsfile               # Future CI/CD pipeline
├── README.md
└── LICENSE
```

The detailed subdirectories mirror the planned ownership boundaries inside each area. Placeholder files are present where needed so Git can preserve empty directories.

## Running the Application Locally

### 1. Start the Backend
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The FastAPI backend will run on `http://localhost:8000`. Swagger API docs available at `http://localhost:8000/docs`.

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
The GenShield security console will be accessible at `http://localhost:5173`.


