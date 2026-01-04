# 🏥 Plum Claim Adjudicator AI - Next-Gen Health Claims Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-blue)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-black)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Database-Supabase-green)](https://supabase.com)
[![AI](https://img.shields.io/badge/AI-Groq%20%2F%20Llama3-orange)](https://groq.com)

This engine automates the processing of health insurance claims, using a rule-based engine for policy validation and an LLM (Large Language Model) for interpreting complex medical documents. It features a modern Admin Dashboard for real-time monitoring and manual review of flagged claims.

## 🚀 Overview

This engine automates the processing of health insurance claims, using a rule-based engine for policy validation and an LLM (Large Language Model) for interpreting complex medical documents. It features a modern Admin Dashboard for real-time monitoring and manual review of flagged claims.

### Main Adjudication Dashboard Overview:

```mermaid
graph TD
    A[Claim Submission] --> B[Document Upload]
    B --> C[AI Processing]
    C --> D[Policy Validation]
    D --> E{Decision Engine}
    E -->|Approved| F[Approve Claim]
    E -->|Rejected| G[Reject Claim]
    E -->|Manual Review| H[Admin Dashboard]
    H --> I[Human Decision]
    I --> J[Final Decision]
    F --> K[Payment Processing]
    G --> L[Notification]
    J --> K
    J --> L
```

## ✨ Key Features

### 1. Automated Adjudication

**Rule Engine**: Validates claims against policy terms (min/max amounts, exclusions).

**AI Analysis**: Uses LLMs to extract and verify diagnosis codes and treatment details from medical documents.

**Instant Decisions**: Automatically approves or rejects clear-cut cases.

### 2. Manual Review Workflow

**Human-in-the-Loop**: Flagged claims (e.g., low confidence, high value) are routed to a review queue.

**Decision Support**: Reviewers see a side-by-side view of the claim data and the AI's analysis.

**One-Click Actions**: Approve or reject claims directly from the UI.

### 3. System Metrics Dashboard

**Real-Time Monitoring**: Track total request volume, API latency, and active requests.

**Traffic Analysis**: Visualize response status codes (2xx, 4xx, 5xx) and top API endpoints.

**Live Charts**: Dynamic charts powered by Recharts for instant visibility into system health.

```mermaid
graph LR
    A[Incoming Claims] --> B[Processing Queue]
    B --> C{System Status}
    C -->|Healthy| D[Low Latency]
    C -->|Warning| E[Medium Latency]
    C -->|Critical| F[High Latency]
    D --> G[Success Metrics]
    E --> H[Warning Metrics]
    F --> I[Error Metrics]
    G --> J[Dashboard Update]
    H --> J
    I --> J
```

## 🛠️ Tech Stack

**Backend**: Python, FastAPI, Pydantic (Data Validation), Supabase (Database)

**Frontend**: Next.js, TypeScript, Tailwind CSS, Recharts, Radix UI

**AI/ML**: Groq API (LLM), OCR for document processing

**Infrastructure**: Vercel (Frontend), Render (Backend), Supabase (Database/Storage)

## 🏗️ System Architecture

The system follows a modern Event-Driven Microservices Architecture, ensuring scalability, fault tolerance, and asynchronous processing.

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js UI]
        B[React Components]
        C[API Client]
    end

    subgraph "Backend Services"
        D[FastAPI Server]
        E[Claim Processing]
        F[AI/LLM Service]
        G[Rule Engine]
    end

    subgraph "Data Layer"
        H[Supabase DB]
        I[Document Storage]
        J[JWT Auth]
    end

    subgraph "External Services"
        K[Groq API]
        L[OCR Service]
    end

    A --> C
    C --> D
    D --> E
    E --> F
    E --> G
    E --> H
    E --> I
    D --> J
    F --> K
    F --> L
    G --> H
    I --> K
```

## 🔄 Adjudication Decision Flow

The rules engine processes extracted data through a series of strict validation steps:

```mermaid
flowchart TD
    A[Claim Submission] --> B{Documents Present?}
    B -->|No| C[Reject: MISSING_DOCUMENTS]
    B -->|Yes| D{All Documents Legible?}
    D -->|No| E[Reject: ILLEGIBLE_DOCUMENTS]
    D -->|Yes| F{Doctor Registration Valid?}
    F -->|No| G[Reject: DOCTOR_REG_INVALID]
    F -->|Yes| H{Patient Details Match Policy?}
    H -->|No| I[Reject: PATIENT_MISMATCH]
    H -->|Yes| J{Treatment Date Valid?}
    J -->|No| K[Reject: DATE_MISMATCH]
    J -->|Yes| L{Policy Active on Treatment Date?}
    L -->|No| M[Reject: POLICY_INACTIVE]
    L -->|Yes| N{Waiting Period Satisfied?}
    N -->|No| O[Reject: WAITING_PERIOD]
    N -->|Yes| P{Treatment Covered?}
    P -->|No| Q[Reject: SERVICE_NOT_COVERED]
    P -->|Yes| R{Claim Amount Within Limits?}
    R -->|No| S[Reject: PER_CLAIM_EXCEEDED]
    R -->|Yes| T{Medical Necessity Valid?}
    T -->|No| U[Reject: NOT_MEDICALLY_NECESSARY]
    T -->|Yes| V{AI Confidence >= 80%?}
    V -->|No| W[Manual Review: LOW_AI_CONFIDENCE]
    V -->|Yes| X{Fraud Indicators Present?}
    X -->|Yes| Y[Manual Review: FRAUD_SUSPECTED]
    X -->|No| Z{High Value Claim?}
    Z -->|Yes| AA[Manual Review: HIGH_VALUE]
    Z -->|No| AB[Approve: Automatic]

    C --> AE[Send Response]
    E --> AE
    G --> AE
    I --> AE
    K --> AE
    M --> AE
    O --> AE
    Q --> AE
    S --> AE
    U --> AE
    W --> AE
    Y --> AE
    AA --> AE
    AB --> AE

    AE[Send Response with Details] --> AF[End]
```

## 🏁 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Git

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 📸 Screenshots

### Admin Dashboard

```mermaid
graph LR
    A[Dashboard Header] --> B[Claims Overview]
    A --> C[Analytics Cards]
    B --> D[Claims Table]
    C --> E[Charts Section]
    D --> F[Action Buttons]
    E --> G[Trend Analysis]
    F --> H[Approve/Reject]
    G --> I[Metrics Display]
```

### Manual Review Interface

```mermaid
graph TD
    A[Claim Details Panel] --> B[Document Preview]
    A --> C[AI Extraction Results]
    B --> D[Side-by-Side Comparison]
    C --> D
    D --> E[Manual Override Options]
    E --> F[Decision Buttons]
    F --> G[Submit Decision]
```

## 📊 Admin Dashboard Features:

**Authentication**: Secure login with role-based access control.

**Policy Management**: View and edit policy rules in real-time.

**System Metrics**: Live dashboard showing Request Volume and API Latency.

**Overview Stats**: Approval rates, total claims, and AI confidence metrics.

**Real-time Dashboard**: A modern, responsive Next.js UI to upload claims, view processing status in real-time, and see detailed adjudication results including approved amounts and rejection reasons.

**Transparent Decisioning**: Provides clear reasons for every rejection or partial approval, along with a confidence score for the AI's extraction.

## 🛠️ Technical Stack & Key Decisions

### Frontend (User Experience)

- **Framework**: Next.js 14 with App Router for optimized performance.
- **Styling**: Tailwind CSS for utility-first styling, ensuring a responsive and modern design.
- **State Management**: React Hooks (useState, useEffect) for local state with Context API for global state.
- **Design System**: Custom "Enterprise" theme with deep indigo hues, glassmorphism effects, and premium typography.

### Backend (Core Logic)

- **API**: FastAPI (Python) for high-performance, async-ready endpoints.
- **Data Validation**: Pydantic models for strict data validation and serialization.
- **Storage**: Supabase (PostgreSQL) for reliable relational data persistence.
- **Authentication**: JWT-based authentication with secure token handling.

### Intelligence Layer

- **OCR**: Groq API (Llama 3.3 70B) for context-aware extraction of medical data.
- **AI Processing**: Advanced LLM integration for cross-document verification.
- **Rules Engine**: A deterministic Python-based engine that enforces policy limits, exclusions, and co-pays strictly.

## 🌐 Live Deployment

- **Frontend App**: [https://claim-adjudicator-ai.vercel.app/](https://claim-adjudicator-ai.vercel.app/)
- **Backend API**: [https://adjudicator-backend.onrender.com](https://adjudicator-backend.onrender.com)

## 📁 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI Routes
│   │   ├── services/     # Adjudicator, AI Extractor, Store, PDF Gen
│   │   ├── schemas/      # Pydantic Models (Unified Domain Model)
│   │   └── core/         # Config & Security
│   ├── config/           # Policy Terms (JSON Rules)
│   ├── data/             # Sample Claims Data
│   └── tests/            # Pytest Suite
├── frontend/
│   ├── app/              # Next.js Pages (Dashboard, Track, Admin)
│   ├── components/       # UI Components (Split-Screen, Charts)
│   └── lib/              # API Client & Utils
└── Given/                # Original Assignment Guidelines
```

## 🚀 How to Run

### Option 1: Local Development

1. Clone the repository:

```bash
git clone https://github.com/NARAsimha654/claim-adjudicator-ai.git
cd claim-adjudicator-ai
```

2. Set up environment variables:
   Create `.env.local` in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Create `.env` in the backend directory:

```env
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_public_key
SUPABASE_BUCKET=claim-documents
```

3. Run the backend:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

4. Run the frontend:

```bash
cd frontend
npm install
npm run dev
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs

### Option 2: Using Docker (Coming Soon)

Docker configuration will be added in future releases for easier deployment.

## 🧪 Testing

Run backend tests:

```bash
cd backend
pytest
```

## 📈 Assumptions Made

- **Document Quality**: Medical documents are of reasonable quality for AI processing
- **Network Reliability**: External APIs (Groq, Supabase) are consistently available
- **User Training**: Admin users have basic computer literacy
- **Policy Consistency**: Policy terms remain stable during processing
- **Data Format**: Medical documents follow standard formats
- **Security**: All API communications are secured with HTTPS
- **Scalability**: System can handle up to 1000 claims per day initially
- **Audit Requirements**: All decisions need to be traceable and auditable

## 🚨 Known Limitations

- Handwritten prescriptions may have lower AI extraction accuracy
- Multi-language documents require additional processing
- Complex medical terminology may need special handling
- High-volume scenarios need performance optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the Plum AI Automation Engineer Intern Assignment.

## 📞 Support

For support, please contact the project maintainers through GitHub issues.
