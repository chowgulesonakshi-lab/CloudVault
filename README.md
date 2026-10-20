# ☁️ CloudVault — Document Management Platform

A full-stack document management platform built to simplify file storage, organization, and retrieval through a modern web interface and a RESTful backend. CloudVault combines **React, Flask, PostgreSQL, Docker, Kubernetes, and Jenkins** to demonstrate containerization, persistent metadata storage, deployment orchestration, and CI/CD automation.

<p align="center">
  <strong>Upload · Organize · Retrieve · Deploy</strong>
</p>

---

## ✨ Features

- **📤 Document Upload** — Upload documents through an intuitive React interface.
- **📚 Document Library** — Browse stored documents with file size, content type, status, and upload timestamp.
- **⬇️ Download & Delete** — Retrieve stored files or remove documents from the library.
- **💚 Health Monitoring** — Check API availability through a dedicated health endpoint.
- **🗄️ PostgreSQL Integration** — Store document metadata in a relational database.
- **🐳 Containerized Backend** — Package and run the Flask API using Docker.
- **☸️ Kubernetes Deployment** — Deploy backend and database resources using Kubernetes manifests.
- **⚙️ CI/CD Automation** — Use Jenkins to automate validation, image building, and deployment steps.

## 🏗️ Architecture

```mermaid
flowchart TD
    A[User] --> B[React + Vite Frontend]
    B -->|HTTP / REST API| C[Flask Backend]
    C --> D[(PostgreSQL)]
    C --> E[Document File Storage]

    C --> F[Health Endpoint]
    G[Jenkins Pipeline] --> H[Backend & Frontend Checks]
    H --> I[Docker Image Build]
    I --> J[Kubernetes Deployment]
    J --> C
    J --> D
```

**How it works:** The frontend communicates with the Flask REST API. The backend manages document operations, stores file metadata in PostgreSQL, and saves uploaded files in backend storage. Docker packages the backend, while Kubernetes manifests describe the deployment resources and Jenkins automates the CI/CD workflow.

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript |
| Backend | Python, Flask, REST API |
| Database | PostgreSQL |
| Containerization | Docker, Docker Compose |
| Orchestration | Kubernetes, kubectl |
| CI/CD | Jenkins |
| Testing & Quality | pytest, ESLint, Vite production build |

## 📁 Project Structure

```text
CloudVault/
├── backend/
│   ├── app.py
│   ├── init_db.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── storage/
│   │   └── documents/
│   └── tests/
├── frontend/
│   ├── src/
│   └── package.json
├── k8s/
│   ├── postgres.yaml
│   ├── backend.yaml
│   └── backend-service.yaml
├── docker-compose.yml
└── Jenkinsfile
```

## 🚀 Getting Started

### Prerequisites

- Python 3.12
- Node.js and npm
- Docker Desktop with Docker Compose, or a local PostgreSQL installation
- Git

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd CloudVault
```

Replace the placeholder with your actual repository URL.

### 2. Start PostgreSQL

From the project root, open PowerShell:

```powershell
$env:POSTGRES_PASSWORD = "choose-a-local-password"
docker compose up -d db
```

The Compose database is named `cloudvault` and is exposed on port `5433` on the host.

### 3. Start the Flask backend

Open a separate PowerShell terminal:

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
$env:DATABASE_URL = "postgresql://postgres:choose-a-local-password@localhost:5433/cloudvault"
python app.py
```

The API will be available at:

`http://localhost:5000`

Use the same local database password in both terminals.

### 4. Start the React frontend

Open another terminal from the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, typically:

`http://localhost:5173`

Keep the backend running at `http://localhost:5000` while using the frontend.

## 🔌 API Reference

Base URL: `http://localhost:5000`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API welcome message |
| `GET` | `/api/health` | Check API health |
| `POST` | `/api/documents/upload` | Upload a document |
| `GET` | `/api/documents` | List stored documents |
| `GET` | `/api/documents/<id>/download` | Download a document |
| `DELETE` | `/api/documents/<id>` | Delete a document |

### Example: Check API Health

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

### Example: Upload a Document

```powershell
curl.exe -X POST `
  -F "file=@C:\path\to\your\document.pdf" `
  http://localhost:5000/api/documents/upload
```

The upload endpoint accepts a multipart form field named `file` and returns `201 Created` on success.

## 🐳 Docker Deployment

Build the backend image and start the Compose services:

```powershell
$env:POSTGRES_PASSWORD = "choose-a-local-password"
docker build -t cloudvault-backend:latest backend
docker compose up -d
```

This starts the backend and PostgreSQL. Run the frontend separately using the development steps above.

Stop the services:

```powershell
docker compose down
```

PostgreSQL uses the `postgres_data` named volume. Uploaded documents are not currently mounted to a persistent volume in the Compose setup, so container replacement may result in file loss.

## ☸️ Kubernetes Deployment

CloudVault includes Kubernetes manifests for PostgreSQL, the backend, and a NodePort service.

After configuring the cluster, building the backend image for its container runtime, and ensuring that the manifests match the target environment, create the database Secret:

```powershell
kubectl create secret generic cloudvault-db-secret `
  --from-literal=POSTGRES_PASSWORD="choose-a-strong-password"
```

Apply the resources:

```powershell
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/backend-service.yaml
```

Verify the deployment:

```powershell
kubectl get pods
kubectl get services
```

The backend service uses NodePort `30080`. The exact access address depends on your cluster configuration.

> **Deployment note:** Uploaded document files are not currently backed by a persistent volume in the Kubernetes backend configuration. Review storage, database credentials, networking, and application configuration before using this setup beyond a development environment.

## ⚙️ CI/CD with Jenkins

The `Jenkinsfile` defines a pipeline for automating the project's build and deployment workflow.

The intended workflow includes:

1. Validate backend and frontend code.
2. Build the backend Docker image.
3. Apply Kubernetes resources.

The Jenkins agent must have the required Python, Node.js, Docker, and Kubernetes tooling configured. Ensure the pipeline's commands, credentials, image availability, and cluster access match your environment before running a deployment.

## 🧪 Testing & Quality Checks

### Backend tests

Run from the `backend/` directory with the virtual environment activated and PostgreSQL available:

```powershell
python -m pytest
```

### Frontend checks

Run from the `frontend/` directory:

```powershell
npm run lint
npm run build
```

## 🔐 Security & Reliability

CloudVault is a development project, and several production-hardening steps remain:

- Add authentication and authorization.
- Validate uploads and enforce file-size and file-type restrictions.
- Use secure configuration and secret management.
- Add persistent storage for uploaded documents.
- Configure production networking and HTTPS.
- Add monitoring, logging, backups, and appropriate error handling.

Do not expose the current unauthenticated API to untrusted networks or use it to store sensitive documents without implementing suitable security controls.

## 🎯 Project Goals

CloudVault brings together full-stack development and infrastructure automation in one project. It provides hands-on experience with:

- Building and integrating a React frontend with a Flask REST API.
- Managing relational data with PostgreSQL.
- Packaging services with Docker and Docker Compose.
- Defining deployments with Kubernetes.
- Automating build and deployment workflows with Jenkins.

## 👩‍💻 Author

**Sonakshi Chowgule**

Computer Science & Engineering | MIT-WPU

---

*CloudVault — Making document management simple, structured, and deployable.*
