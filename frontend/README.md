# GenShield Frontend

Enterprise React & TypeScript User Interface for **GenShield: Semantic Data Exfiltration Detection & Prevention System**.

## 🚀 Overview

GenShield provides real-time semantic surveillance over LLM generated responses, intercepting confidential business context leakage through an explainable four-signal architecture:
1. **Semantic Similarity Scoring** (dense vector embeddings & cosine distance)
2. **Factual Overlap Analysis** (named entities, financial numbers, dates, projects)
3. **Data Lineage Provenance** (tracking leaked text directly to source documents & tags)
4. **Explainable Risk Scoring & Policy Enforcement** (`ALLOW`, `WARN`, `BLOCK`)

---

## 🛠️ Technology Stack

- **Framework**: React 18 & TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (Dark Cyber Security Theme)
- **Visualizations**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios with centralized Bearer token interceptor
- **Routing**: React Router DOM v6
- **Animation**: Framer Motion & CSS custom keyframes

---

## 📁 Project Structure

```text
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── audit/            # AuditTable, AuditFilters, AuditDetailsModal
│   │   ├── common/           # LoadingSpinner, DecisionBadge, RiskScoreGauge, EmptyState, etc.
│   │   ├── dashboard/        # StatCards, DetectionChart, RecentDetections, RiskOverview
│   │   ├── documents/        # DocumentTable, DocumentDetailsModal, DocumentFormModal, FactList
│   │   ├── layout/           # AppLayout, Sidebar, Header, MobileSidebar
│   │   ├── security/         # DetectionBreakdown, SimilarityScore, FactOverlap, LineageCard, DetectionPlayground
│   │   └── simulator/        # ScenarioSelector, ScenarioCard, PromptInput, GeneratedResultCard
│   ├── context/
│   │   └── AuthContext.tsx   # Session management & JWT persistence
│   ├── hooks/                # useAuth, useDashboard, useGenerate, useDetection, useHistory, useDocuments
│   ├── pages/                # LoginPage, RegisterPage, DashboardPage, SimulatorPage, etc.
│   ├── routes/               # ProtectedRoute, PublicRoute
│   ├── services/             # api.ts, authApi.ts, dashboardApi.ts, generateApi.ts, detectApi.ts, historyApi.ts, documentsApi.ts
│   ├── types/                # auth.ts, api.ts, dashboard.ts, detection.ts, history.ts, documents.ts
│   ├── utils/                # constants.ts, errorHandler.ts, formatters.ts, storage.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env.example
├── Dockerfile
├── nginx.conf
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Configuration
Create `.env` or use default:
```env
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Run Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```

---

## 🔐 Authentication & Demo Access

The frontend is integrated with the backend's JWT authentication mechanism (`/api/auth/login` and `/api/auth/register`).

- **Demo Operator Fill**: Click the "Fill Demo Credentials" button on the login screen, or register any new account (`min 8 characters password`).
- **Protected Sessions**: Tokens are stored securely in browser storage and automatically refreshed via `GET /api/auth/me`.
