# Architecture Diagram

## System Architecture Overview

```mermaid
graph TB
    subgraph "User Layer"
        A[Browser/Mobile App]
    end

    subgraph "Application Layer"
        B[Next.js Frontend]
        C[FastAPI Backend]
    end

    subgraph "Infrastructure Layer"
        D[Vercel Hosting]
        E[Render Backend]
    end

    subgraph "AI/ML Services"
        F[Groq Cloud AI]
        G[Document Processing]
    end

    subgraph "Data Layer"
        H[Supabase Database]
        I[Document Storage]
    end

    A <---> B
    B <---> C
    C <---> D
    C <---> E
    C <---> F
    C <---> G
    C <---> H
    C <---> I
    F <---> G
    H <---> I
```

## Component Interaction Flow

### 1. Claim Submission Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant AI as AI Service
    participant DB as Database

    U->>F: Submit Claim with Documents
    F->>B: Send Claim Data
    B->>AI: Process Documents
    AI->>B: Return Extracted Data
    B->>B: Apply Policy Rules
    B->>DB: Store Decision
    B->>F: Return Decision
    F->>U: Display Result
```

### 2. Document Processing Flow

```mermaid
flowchart TD
    A[Document Upload] --> B[OCR Processing]
    B --> C[Text Extraction]
    C --> D[Data Validation]
    D --> E[Rule Engine]
    E --> F[Decision Trace]
    F --> G[Database Storage]
```

### 3. Decision Override Flow

```mermaid
flowchart TD
    A[Admin Review] --> B[Frontend UI]
    B --> C[Backend API]
    C --> D[Decision Override]
    D --> E[Database Update]
    E --> F[Audit Trail]
    F --> G[Notification]
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

```mermaid
flowchart TD
    A[User Login] --> B[JWT Token Generation]
    B --> C[Token Validation]
    C --> D[Session Management]
    D --> E[Role-based Access Control]
```

### Document Security

```mermaid
flowchart TD
    A[Upload] --> B[Encryption]
    B --> C[Secure Storage]
    C --> D[Access Control]
    D --> E[Audit Trail]
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

```mermaid
flowchart LR
    A[Claim Submission] --> B[Validation]
    B --> C[AI Processing]
    C --> D[Rule Engine]
    D --> E[Decision]
    E --> F[Storage]
    F --> G[Audit Trail]
```

### Document Data Flow

```mermaid
flowchart LR
    A[Document Upload] --> B[OCR Processing]
    B --> C[Text Extraction]
    C --> D[Data Structuring]
    D --> E[Validation]
    E --> F[Storage]
```

### Audit Data Flow

```mermaid
flowchart LR
    A[User Action] --> B[Event Logging]
    B --> C[Audit Trail]
    C --> D[Database Storage]
    D --> E[Reporting]
```
