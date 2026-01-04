# Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              PLUM CLAIM ADJUDICATOR AI                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   USER LAYER    │    │  APPLICATION    │    │  INFRASTRUCTURE │            │
│  │                 │    │     LAYER       │    │      LAYER      │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│         │                        │                        │                    │
│         │                        │                        │                    │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   BROWSER/      │    │   NEXT.JS       │    │   VERCEL        │            │
│  │   MOBILE APP    │◄──►│   FRONTEND      │◄──►│   HOSTING       │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│         │                        │                        │                    │
│         │                        │                        │                    │
│         │                        │                        │                    │
│         │                        │                        │                    │
│         │                        │                        │                    │
│         │                        │                        │                    │
│         │    ┌─────────────────────────────────────────────┐                   │
│         │    │            API GATEWAY LAYER              │                   │
│         │    │         (FastAPI + CORS)                  │                   │
│         │    └─────────────────────────────────────────────┘                   │
│         │                        │                        │                    │
│         │                        │                        │                    │
│         │                        │                        │                    │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   CLAIM FORM    │    │  CLAIM ADJUDICATOR│    │   RENDER        │        │
│  │   SUBMISSION    │◄──►│   SERVICE       │◄──►│   BACKEND       │            │
│  │                 │    │                 │    │   DEPLOYMENT    │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│         │                        │                        │                    │
│         │                        │                        │                    │
│         │                        │                        │                    │
│         │                        │                        │                    │
│         │    ┌─────────────────────────────────────────────┐                   │
│         │    │           EXTERNAL SERVICES               │                   │
│         │    └─────────────────────────────────────────────┘                   │
│         │                        │                        │                    │
│         │                        │                        │                    │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   GROQ CLOUD    │    │   SUPABASE      │    │   DOCUMENT      │            │
│  │   (AI/LLM)      │    │   DATABASE      │    │   STORAGE       │            │
│  │                 │    │                 │    │                 │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│         │                        │                        │                    │
│         │                        │                        │                    │
│         │                        │                        │                    │
│         │                        │                        │                    │
│         │                        │                        │                    │
│         │                        │                        │                    │
│         │                        │                        │                    │
│         │                        │                        │                    │
│         │                        │                        │                    │
│         │                        │                        │                    │
│         │                        │                        │                    │
│         │                        │                        │                    │
│         │                        │                        │                    │
│         │                        │                        │                    │
│         │                        │                        │                    │
│         │                        │                        │                    │
│         │                        │                        │                    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Component Interaction Flow

### 1. Claim Submission Flow

```
User → Frontend → Backend API → AI Extraction → Policy Validation → Decision Engine → Database → Response to Frontend → User
```

### 2. Document Processing Flow

```
Document Upload → AI Service → Text Extraction → Data Validation → Rule Engine → Decision Trace → Database Storage
```

### 3. Decision Override Flow

```
Admin Review → Frontend → Backend API → Decision Override → Database Update → Audit Trail → Notification
```

## Technology Stack Layers

### Presentation Layer

- **Next.js 14**: React-based frontend framework
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives

### Application Layer

- **FastAPI**: Python web framework with automatic API documentation
- **Pydantic**: Data validation and settings management
- **Python 3.10+**: Backend language

### AI/ML Layer

- **Groq Cloud**: AI inference platform
- **Llama 3.3 70B**: Large language model for document understanding
- **OCR Processing**: Text extraction from medical documents

### Data Layer

- **Supabase**: PostgreSQL database with real-time capabilities
- **Supabase Storage**: Document storage with access controls
- **JWT Authentication**: Secure session management

### Infrastructure Layer

- **Vercel**: Frontend deployment and hosting
- **Render**: Backend deployment and hosting
- **GitHub**: Source code management
- **Environment Variables**: Secure configuration management

## Security Architecture

### Authentication Flow

```
User Login → JWT Token Generation → Token Validation → Session Management → Role-based Access Control
```

### Document Security

```
Upload → Encryption → Secure Storage → Access Control → Audit Trail
```

## Scalability Considerations

### Current Architecture

- **Monolithic Backend**: Single FastAPI application
- **Serverless Frontend**: Next.js app deployed on Vercel
- **Managed Services**: Supabase for database and storage

### Future Scalability

- **Microservices**: Split into independent services
- **Caching Layer**: Redis for frequently accessed data
- **CDN**: For static assets and document delivery
- **Load Balancer**: For handling high traffic scenarios

## Data Flow Architecture

### Claim Data Flow

```
Claim Submission → Validation → AI Processing → Rule Engine → Decision → Storage → Audit Trail
```

### Document Data Flow

```
Document Upload → OCR Processing → Text Extraction → Data Structuring → Validation → Storage
```

### Audit Data Flow

```
User Action → Event Logging → Audit Trail → Database Storage → Reporting
```
