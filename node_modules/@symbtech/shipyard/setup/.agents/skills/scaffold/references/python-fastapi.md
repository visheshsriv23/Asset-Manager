# Python + FastAPI Organization Guide

This document defines the organization's standard architecture for all Python + FastAPI backend services.

Whenever a FastAPI project is scaffolded, this guide is the authoritative source for project structure, tooling, dependencies, conventions, and coding standards.

Unless the user explicitly requests otherwise, always follow this guide.

This scaffold intentionally contains **no domain-specific models, business logic, routes, or schemas** beyond the application skeleton.

---

# Required Questions

Before generating any files, collect the following information from the user.

## Project Information

- Project name
- Service name
- Package name (optional)

The **service name** is used when generating environment variables and application configuration.

Convert the service name into **UPPER_SNAKE_CASE**.

Examples:

```
User Service
→ USER_SERVICE

Payment Service
→ PAYMENT_SERVICE

Notification Service
→ NOTIFICATION_SERVICE

Inventory
→ INVENTORY
```

Never hardcode a service name into generated files.

---

## Technical Decisions

Ask the user for:

- Database
- Authentication required?
- Docker required?
- Bitbucket Pipeline required?

Ask any additional questions required by this guide before scaffolding.

---

# Tech Stack

- Python 3.x
- FastAPI (Application Factory Pattern)
- Uvicorn
- SQLAlchemy (Sync + Async)
- Alembic
- PostgreSQL
- psycopg2-binary
- asyncpg
- Pydantic v2
- PyJWT
- passlib + bcrypt
- structlog
- sentry-sdk
- prometheus-fastapi-instrumentator
- pytest

---

# Local Commands

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source ./venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run locally
uvicorn app:app --reload --host 127.0.0.1 --port 5000

# Run tests
pytest

# Create migration
alembic revision --autogenerate -m "describe change"

# Apply migrations
alembic upgrade head
```

---

# Required Environment Variables

Generate service-specific environment variables using the selected service name.

Template:

```
<SERVICE_NAME>_DB_URI
<SERVICE_NAME>_DB_URI_ASYNC
<SERVICE_NAME>_JWT_SECRET_KEY
<SERVICE_NAME>_ACCESS_TOKEN_EXPIRATION_TIME
```

Example:

```
USER_SERVICE_DB_URI
USER_SERVICE_DB_URI_ASYNC
USER_SERVICE_JWT_SECRET_KEY
USER_SERVICE_ACCESS_TOKEN_EXPIRATION_TIME
```

Also generate common environment variables:

```
ENV
```

Allowed values:

```
local
dev
staging
production
```

Generate an `.env.example`.

Never generate:

- Real secrets
- Passwords
- API keys
- Tokens
- Production credentials

---

# Application Layout

```
app.py

application/
├── __init__.py
├── configuration/
│   ├── app.py
│   ├── constants.py
│   ├── db.py
│   ├── db_async.py
│   ├── logger.py
│   └── sentry.py
│
├── dependencies/
│
├── exception/
│
├── middleware/
│
├── models/
│
├── routes/
│
├── schemas/
│
├── services/
│
└── utilities/

migration/

tests/

docs/

requirements.txt

.env.example

README.md
```

Do not modify this layout unless explicitly requested.

---

# Bitbucket Pipeline

If the user chooses to generate a `bitbucket-pipelines.yml`, interview the user before generating it.

## Pipeline Configuration

Ask:

### Pipeline Type

- CI only
- CI + Build
- CI + Build + Publish
- Full CI/CD

---

### Docker

- Should Docker be used?
- Generate Dockerfile?
- Docker image naming convention?

---

### Testing

Ask:

- Test command
- Coverage required?

---

### Linting

Ask:

- Lint command
- Formatter
- Linter

---

### Required Services

Ask whether CI requires additional services.

Examples:

- PostgreSQL
- MySQL
- Redis
- RabbitMQ
- MongoDB
- Docker

For each selected service ask:

- Version
- Configuration (if needed)

---

### Deployment Environments

Ask the user to define the deployment environments.

Do not assume the project uses Development, Staging, and Production.

Ask:

```
List the deployment environments.

For each environment provide:

- Environment name
- Branch name
- Auto Deploy (Yes/No)
- Manual Approval (Yes/No)
```

Example:

| Environment | Branch | Auto Deploy | Manual Approval |
|-------------|--------|-------------|-----------------|
| Development | develop | Yes | No |
| QA | qa | Yes | No |
| Staging | staging | Yes | No |
| Production | production | No | Yes |

Generate the `branches:` section from these answers.

---

### Container Registry

If Docker images are published ask:

- Registry type
    - DockerHub
    - AWS ECR
    - GitHub Container Registry
    - Azure ACR
    - Google Artifact Registry
    - Private Registry

Generate placeholder Bitbucket Repository Variables.

Examples:

```
DOCKERHUB_USERNAME
DOCKERHUB_PASSWORD
```

Never hardcode secrets.

---

### Deployment

If deployment is enabled ask:

- Deployment method
    - SSH
    - Docker Compose
    - Kubernetes
    - Helm
    - ECS
    - Cloud Run

Collect any additional information required by the selected deployment method.

Generate placeholder repository variables where appropriate.

Example:

```
SERVER_IP
SERVER_USER
DEPLOY_PATH
DOCKER_COMPOSE_SERVICE
```

Never hardcode server credentials.

---

### Post Deployment

Ask whether to generate:

- Docker Compose Pull
- Docker Compose Up
- Nginx Reload
- Health Check
- Database Migration
- Docker Cleanup

---

Generate `bitbucket-pipelines.yml` only after all required information has been collected.

---

# Documentation Conventions

Project documentation lives under `docs/`.

| Skill | Output Folder |
|-------|---------------|
| `/to-prd` | `docs/prd/` |
| `/to-issues` | `docs/issues/<prd-slug>/` |
| `/handoff` | `docs/handoff/` |

Never place generated documents directly under `docs/`.

---

# Change Boundaries

Always ask before changing:

- Database schema
- Alembic migration history
- Authentication strategy
- JWT payload
- Password policy
- Public API contracts
- Route paths
- Response envelope

Never make breaking architectural changes automatically.

---

# Scaffold Philosophy

Generate only the application foundation.

Do not generate:

- Business logic
- Feature implementations
- Domain models
- Application-specific APIs
- Business routes

unless the user explicitly requests them.

The generated scaffold should be production-ready but domain-agnostic.