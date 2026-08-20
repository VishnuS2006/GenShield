# GenShield Verification Checklist

## Application

- [x] Dashboard
- [x] ChatGPT-style chatbot
- [x] New Chat
- [x] Conversation history
- [x] Conversation search
- [x] Rename conversation
- [x] Delete conversation
- [x] Multi-turn conversation
- [x] Retry
- [x] Regenerate
- [x] Copy response
- [x] Security Analysis
- [x] Profile
- [x] Settings

## RAG

- [x] Protected company knowledge
- [x] RAG retrieval
- [x] Conversation context
- [x] Separate conversation memory from protected documents
- [x] Embeddings
- [x] Relevant source retrieval

## Security

- [x] Semantic similarity
- [x] Factual overlap
- [x] Sensitivity
- [x] Risk engine
- [x] ALLOW
- [x] WARN
- [x] BLOCK
- [x] Data lineage
- [x] Audit logs

## PostgreSQL

- [x] Users
- [x] Conversations
- [x] Messages
- [x] Protected documents
- [x] Protected facts
- [x] Detection results
- [x] Audit logs
- [x] Data lineage

## PostgreSQL Inspection

- [x] Docker PostgreSQL command documented
- [x] psql commands documented
- [x] Table inspection commands documented
- [x] pgAdmin connection documented
- [x] How to view conversations documented
- [x] How to view messages documented
- [x] How to view detections documented
- [x] How to view lineage documented

## Docker

- [ ] Docker build works
- [ ] Docker Compose works
- [ ] PostgreSQL starts
- [ ] Backend starts
- [ ] Frontend starts
- [ ] Containers communicate
- [x] Environment variables work

## Testing

- [x] Login
- [x] New chat
- [x] Send message
- [x] Receive AI response
- [x] RAG retrieval
- [x] Multi-turn context
- [x] History persistence
- [x] Database persistence
- [x] ALLOW tested
- [x] WARN tested
- [x] BLOCK tested
- [x] Security analysis tested
- [x] Dashboard tested
- [x] Profile tested
- [x] Settings tested

## PostgreSQL Database Inspection

Root Docker Compose service names:

- PostgreSQL service: `db`
- Backend service: `backend`
- Frontend service: `frontend`

Start the database stack:

```bash
docker compose up -d db
```

Open PostgreSQL CLI:

```bash
docker compose exec db psql -U <POSTGRES_USER> -d <POSTGRES_DB>
```

Use the actual values from root `.env` or `.env.example`:

- `POSTGRES_USER`
- `POSTGRES_DB`
- `POSTGRES_PASSWORD`

Inspect tables:

```sql
\dt
\d chat_conversations
\d chat_messages
\d detection_results
```

View records:

```sql
SELECT * FROM users;
SELECT * FROM chat_conversations ORDER BY created_at DESC;
SELECT * FROM chat_messages ORDER BY created_at DESC;
SELECT * FROM protected_documents;
SELECT * FROM protected_facts;
SELECT * FROM detection_results ORDER BY created_at DESC;
SELECT * FROM audit_logs ORDER BY created_at DESC;
SELECT * FROM data_lineage;
```

Use limits for larger datasets:

```sql
SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 20;
SELECT * FROM detection_results ORDER BY created_at DESC LIMIT 20;
```

## pgAdmin

Open pgAdmin and add a new server with:

- Host: `localhost`
- Port: `5432`
- Maintenance database: value of `POSTGRES_DB`
- Username: value of `POSTGRES_USER`
- Password: value of `POSTGRES_PASSWORD`

Navigation:

1. `Servers`
2. `PostgreSQL`
3. `Databases`
4. GenShield database
5. `Schemas`
6. `public`
7. `Tables`

Open:

- `users`
- `chat_conversations`
- `chat_messages`
- `protected_documents`
- `protected_facts`
- `detection_results`
- `audit_logs`
- `data_lineage`

## Remaining Blocker

- Docker runtime verification is still blocked on Wednesday, August 19, 2026 because the local Docker Desktop daemon was not running, so `docker compose build` could not connect to `//./pipe/dockerDesktopLinuxEngine`.
