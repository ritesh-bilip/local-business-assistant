# System Architecture

```mermaid
graph TB
    subgraph Users["👥 Users"]
        U1[Business Admin]
        U2[Staff]
        U3[Customer]
    end

    subgraph Frontend["🎨 Frontend - React SPA<br/>:3000"]
        L[Landing Page]
        LOGIN[Login / Register]
        DASH[Dashboard]
        DOCS[Documents]
        QA[Ask Console]
        PROP[Proposal Generator]
        SAVED[Saved Proposals]
        HIST[History]
    end

    subgraph Backend["🔧 Backend - Django + DRF<br/>:8000"]
        AUTH[JWT Auth]
        DOCAPI[Documents API]
        SEARCH[Search API]
        ASK[Ask API]
        STREAM[Streaming SSE]
        PROPOSAL[Proposal API]
        LOG[Query Log]
    end

    subgraph Workers["⚡ Celery Worker"]
        TASK[process_document]
    end

    subgraph Data["💾 Data Layer"]
        PG[(PostgreSQL<br/>:5433)]
        REDIS[(Redis<br/>:6380)]
        MINIO[(MinIO<br/>:9000)]
        FAISS[(FAISS Index<br/>on disk)]
    end

    subgraph AI["🧠 Local AI"]
        MINILM[MiniLM<br/>Embeddings]
        LLAMA[llama.cpp<br/>TinyLlama]
    end

    U1 --> L
    U2 --> DASH
    U3 --> QA

    L --> LOGIN
    LOGIN --> AUTH
    DASH --> DOCAPI
    DASH --> HIST
    DOCS --> DOCAPI
    QA --> STREAM
    QA --> SEARCH
    PROP --> PROPOSAL
    SAVED --> PROPOSAL

    AUTH --> PG
    DOCAPI --> MINIO
    DOCAPI --> REDIS
    SEARCH --> MINILM
    SEARCH --> FAISS
    STREAM --> ASK
    ASK --> MINILM
    ASK --> FAISS
    ASK --> LLAMA
    ASK --> LOG
    PROPOSAL --> ASK
    LOG --> PG

    REDIS --> TASK
    TASK --> MINIO
    TASK --> MINILM
    TASK --> FAISS
    TASK --> PG

    classDef frontend fill:#61DAFB,stroke:#333,stroke-width:2px,color:#000
    classDef backend fill:#092E20,stroke:#333,stroke-width:2px,color:#fff
    classDef worker fill:#F5A623,stroke:#333,stroke-width:2px,color:#000
    classDef data fill:#4A90E2,stroke:#333,stroke-width:2px,color:#fff
    classDef ai fill:#8B5CF6,stroke:#333,stroke-width:2px,color:#fff

    class L,LOGIN,DASH,DOCS,QA,PROP,SAVED,HIST frontend
    class AUTH,DOCAPI,SEARCH,ASK,STREAM,PROPOSAL,LOG backend
    class TASK worker
    class PG,REDIS,MINIO,FAISS data
    class MINILM,LLAMA ai
```

## Component Responsibilities

| Component | Responsibility |
|---|---|
| **React SPA** | UI, routing, SSE consumption, PDF export |
| **Django API** | Auth, business logic, RAG orchestration, audit logging |
| **Celery Worker** | Async document ingestion (extract → chunk → embed → index) |
| **PostgreSQL** | Users, businesses, documents, chunks, query logs, proposals |
| **Redis** | Celery task broker + result backend |
| **MinIO** | Uploaded file storage (S3-compatible, self-hosted) |
| **FAISS** | Vector index for semantic search (per-tenant filter at query time) |
| **MiniLM** | Query + chunk embeddings (384-dim) |
| **llama.cpp** | Local LLM inference — grounded prompt → streamed answer |