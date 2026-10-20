# CloudVault

CloudVault is a web application for storing and managing documents. It pairs a
React and Vite frontend with a Flask REST API, PostgreSQL metadata storage, and
file storage on the backend.

## Features

- Upload a document using the web interface.
- Browse the document library, including file size, content type, status, and
  upload date.
- Download or delete a stored document.
- View API availability and basic document/storage totals.
- Run the backend and PostgreSQL with Docker Compose, or deploy the backend
  and database to Kubernetes.

## Project layout

```text
.
├── backend/
│   ├── app.py                 # Flask API and document storage
│   ├── init_db.py             # Create database tables
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile
│   ├── storage/documents/     # Uploaded files
│   └── tests/                 # Backend tests
├── frontend/
│   ├── src/                   # React application
│   └── package.json
├── k8s/                       # Kubernetes resources
├── docker-compose.yml         # PostgreSQL and backend services
└── Jenkinsfile                # CI/CD pipeline
```

## Requirements

- Python 3.12 (the backend Docker image uses Python 3.12)
- Node.js and npm
- PostgreSQL, or Docker Desktop with Docker Compose
- Optional for Kubernetes deployment: `kubectl` and a configured cluster

## Run locally

The following steps use PowerShell. Open separate terminals for PostgreSQL,
the backend, and the frontend.

### 1. Start PostgreSQL

From the project root, start the database service defined in Compose:

```powershell
$env:POSTGRES_PASSWORD = "choose-a-local-password"
docker compose up -d db
```

PostgreSQL is exposed on `localhost:5433` and the Compose database is named
`cloudvault`.

### 2. Install and start the backend

In a new terminal, from the project root:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
$env:DATABASE_URL = "postgresql://postgres:choose-a-local-password@localhost:5433/cloudvault"
python app.py
```

The API listens on `http://localhost:5000`. When started this way, the
application creates its database tables automatically. To create the tables
explicitly, use `python init_db.py` from the `backend` directory after setting
`DATABASE_URL`.

### 3. Install and start the frontend

In another terminal, from the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`). The
frontend currently sends API requests to `http://localhost:5000/api`; keep the
backend available at that address while using the UI.

## Docker Compose

Compose starts PostgreSQL and the backend, but not the frontend. Build the
backend image before starting the full stack:

```powershell
$env:POSTGRES_PASSWORD = "choose-a-local-password"
docker build -t cloudvault-backend:latest backend
docker compose up -d
```

The API is available at `http://localhost:5000`, and PostgreSQL is exposed at
`localhost:5433`. Start the frontend separately using the steps above.

The Compose setup persists PostgreSQL data in the `postgres_data` named volume.
It does not mount the backend's uploaded-document directory to a persistent
volume, so files stored in the backend container may not survive container
replacement.

To stop the Compose services:

```powershell
docker compose down
```

To also remove the PostgreSQL data volume, use `docker compose down -v`.

## API

All document endpoints are served by the Flask backend on port `5000`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | Welcome message |
| `GET` | `/api/health` | API health status |
| `POST` | `/api/documents/upload` | Upload a multipart form file using the `file` field |
| `GET` | `/api/documents` | List documents, newest first |
| `GET` | `/api/documents/<id>/download` | Download a document |
| `DELETE` | `/api/documents/<id>` | Delete a document and its stored file |

An upload returns `201 Created` with the document ID, filename, file size,
content type, and status. The list endpoint returns those fields along with the
upload timestamp. Missing upload files are rejected with `400`; a missing
document or on-disk file returns `404`.

Example health check:

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

## Tests and frontend checks

Backend tests require `DATABASE_URL` to point to a reachable PostgreSQL
database. From the `backend` directory, with the virtual environment active
and the database available:

```powershell
python -m pytest
```

From the `frontend` directory:

```powershell
npm run lint
npm run build
```

## Kubernetes

The manifests in `k8s/` define a PostgreSQL deployment with a persistent volume
claim, a backend deployment, and a NodePort service on port `30080`.

Before deploying, build the backend image for the cluster's container runtime
and create the expected database Secret with your own password:

```powershell
kubectl create secret generic cloudvault-db-secret `
  --from-literal=POSTGRES_PASSWORD="choose-a-strong-password"
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl get pods
kubectl get services
```

The backend service is exposed as a NodePort; the address depends on your
Kubernetes cluster. The deployment currently does not mount persistent storage
for uploaded files. The Kubernetes manifests should be reviewed and configured
for the target cluster before production use.

## Configuration and operational notes

- The backend requires `DATABASE_URL`, a PostgreSQL connection URL. For local
  use with the Compose database, set it as shown above.
- Uploaded files are saved under `backend/storage/documents`; document
  metadata is stored in PostgreSQL.
- The frontend API address is currently hard-coded to
  `http://localhost:5000/api`.
- The current API has no authentication or authorization. Do not expose it to
  untrusted networks or use it for sensitive documents without adding suitable
  access controls and reviewing the deployment configuration.
- The Jenkins pipeline runs backend and frontend checks, builds the backend
  image, and applies Kubernetes resources. Its agent must have the required
  Python, Node.js, Docker, and Kubernetes tooling configured.
