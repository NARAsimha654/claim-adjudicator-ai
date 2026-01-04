# 🏥 Strict AI Adjudicator: Next-Gen Health Claims Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-blue)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-black)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Database-Supabase-green)](https://supabase.com)
[![AI](https://img.shields.io/badge/AI-Groq%20%2F%20Llama3-orange)](https://groq.com)

A professional, cloud-native automated health insurance adjudication platform. This system processes medical documents using AI, validates them against strict insurance policies, and provides a high-fidelity workspace for human-in-the-loop review.

---

## 🌐 Live Deployment

- **Frontend App**: [https://claim-adjudicator-ai.vercel.app/](https://claim-adjudicator-ai.vercel.app/)
- **Backend API**: [https://adjudicator-backend.onrender.com](https://adjudicator-backend.onrender.com)

---

## 🚀 Key Features

### 1. **Multi-Doc AI Extraction**

- **Contextual OCR**: Uses **Groq (Llama 3.3 70B)** to cross-verify data between medical bills and prescriptions.
- **Fraud Detection**: Identifies mismatches in hospital names, dates, or items billed but not prescribed.
- **Confidence Scoring**: Automatically flags claims for manual review if AI confidence drops below 80%.

### 2. **Ultimate Admin Workspace**

- **Split-Screen Review**: Side-by-side view of the original document content vs. the AI-extracted data.
- **Inline Corrections**: Allows admins to override AI fields or verdicts with manual notes.
- **Unified Analytics**: Real-time stats on approval rates, money saved, and AI performance.

### 3. **Enterprise-Grade Security**

- **JWT Authentication**: Secure user sessions with role-based access.
- **Document Isolation**: Encrypted storage with granular access controls.
- **Audit Trails**: Complete log of all decisions and manual interventions.

---

## 🛠️ Tech Stack

| Layer              | Technology                          | Purpose                                  |
| ------------------ | ----------------------------------- | ---------------------------------------- |
| **Frontend**       | Next.js 14, TypeScript, Tailwind    | Responsive UI with real-time updates     |
| **Backend**        | FastAPI, Python 3.10                | High-performance API with automatic docs |
| **AI/ML**          | Groq Cloud (Llama 3.3 70B)          | Document understanding & extraction      |
| **Database**       | Supabase (PostgreSQL)               | Secure data storage with real-time sync  |
| **Deployment**     | Vercel (Frontend), Render (Backend) | Global CDN & auto-scaling                |
| **Authentication** | Supabase Auth                       | Secure user management                   |

---

## 📦 Project Structure

```text
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

---

## ⚙️ Environment Variables (.env)

Create `.env.local` in the frontend directory:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

Create `.env` in the backend directory:

```env
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_public_key
SUPABASE_BUCKET=claim-documents
```

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/NARAsimha654/claim-adjudicator-ai.git
cd claim-adjudicator-ai
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 📊 API Endpoints

### Claims

- `POST /claims/submit` - Submit new claim with documents
- `GET /claims/{claim_id}` - Get claim details
- `GET /claims/` - List all claims (admin)
- `POST /claims/{claim_id}/override` - Manual decision override

### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user

---

## 🧪 Testing

Run backend tests:

```bash
cd backend
pytest
```

---

## 🏗️ Architecture Overview

The system follows a microservices architecture with clear separation of concerns:

1. **Frontend Service**: Next.js application handling user interactions
2. **Backend API**: FastAPI service processing business logic
3. **AI Service**: Groq integration for document processing
4. **Database Layer**: Supabase for data persistence
5. **Document Storage**: Supabase storage for medical documents

---

## 📈 Assumptions Made

1. **Document Quality**: Medical documents are of reasonable quality for OCR processing
2. **Network Reliability**: External APIs (Groq, Supabase) are consistently available
3. **User Training**: Admin users have basic computer literacy
4. **Policy Consistency**: Policy terms remain stable during processing
5. **Data Format**: Medical documents follow standard formats
6. **Security**: All API communications are secured with HTTPS
7. **Scalability**: System can handle up to 1000 claims per day initially
8. **Audit Requirements**: All decisions need to be traceable and auditable

---

## 🚨 Known Limitations

- Handwritten prescriptions may have lower OCR accuracy
- Multi-language documents require additional processing
- Complex medical terminology may need special handling
- High-volume scenarios need performance optimization

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is part of the Plum AI Automation Engineer Intern Assignment.

---

## 📞 Support

For support, please contact the project maintainers through GitHub issues.
