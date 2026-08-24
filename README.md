# RetailFlow 

A full-stack **e-commerce application built using a microservices architecture**, with independent backend services, polyglot databases, containerized deployment, Kubernetes orchestration, CI/CD, cloud infrastructure and application monitoring.

##  Overview

RetailFlow demonstrates how a modern retail application can be designed as independently deployable microservices.

The system consists of:

* **React.js** frontend
* **Product Service** — Python + FastAPI + PostgreSQL
* **Order Service** — Node.js + Express + MongoDB
* **User Service** — Node.js + Express + Redis + JWT
* **Notification Service** — Python + FastAPI
* **Nginx** — reverse proxy/API gateway
* **Docker & Docker Compose** — containerization and local orchestration
* **Kubernetes** — container orchestration and scaling
* **Jenkins** — CI/CD pipeline
* **Terraform + AWS** — Infrastructure as Code
* **Prometheus + Grafana** — monitoring
* **k6** — load testing

---

##  Architecture

```text
                         ┌─────────────────┐
                         │   React Frontend │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │      Nginx      │
                         │ API Gateway /   │
                         │ Reverse Proxy   │
                         └────────┬────────┘
                                  │
              ┌───────────────────┼────────────────────┐
              │                   │                    │
              ▼                   ▼                    ▼
     ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
     │ Product Service│  │ Order Service  │  │  User Service  │
     │ FastAPI/Python │  │ Node/Express   │  │ Node/Express   │
     └───────┬────────┘  └───────┬────────┘  └───────┬────────┘
             │                   │                    │
             ▼                   ▼                    ▼
       ┌───────────┐       ┌───────────┐        ┌───────────┐
       │ PostgreSQL│       │  MongoDB   │        │   Redis   │
       └───────────┘       └───────────┘        └───────────┘

                         ┌──────────────────┐
                         │ Notification     │
                         │ Service          │
                         │ FastAPI/Python   │
                         └──────────────────┘

        Docker → Kubernetes → AWS EKS
                     │
          ┌──────────┴──────────┐
          │                     │
      Prometheus             Grafana
          │
       Metrics

        Jenkins → Build → Test → Deploy
```

---

##  Features

### Product Management

* Create products
* Retrieve all products
* Retrieve product by ID
* Delete products
* Store product information in PostgreSQL
* Product health-check endpoint

### User Authentication

* User registration
* Password hashing using bcrypt
* User login
* JWT token generation
* Redis-based session/token storage
* Protected profile endpoint
* Token expiry after one hour

### Order Management

* Create orders
* Retrieve order by ID
* Retrieve orders for a user
* Track order status
* Store orders in MongoDB

### Notifications

Supports events such as:

* `order_created`
* `order_shipped`
* `order_delivered`

The notification service generates a corresponding notification response and currently simulates delivery through application logging.

---

#  Microservices

## 1. Product Service

**Technology:** Python, FastAPI, SQLAlchemy, PostgreSQL, Pydantic

Runs on port `8000`.

### API

| Method | Endpoint         | Description          |
| ------ | ---------------- | -------------------- |
| GET    | `/health`        | Service health check |
| GET    | `/products`      | Get all products     |
| GET    | `/products/{id}` | Get product by ID    |
| POST   | `/products`      | Create product       |
| DELETE | `/products/{id}` | Delete product       |

SQLAlchemy provides ORM functionality while PostgreSQL stores persistent product data.

---

## 2. Order Service

**Technology:** Node.js, Express.js, Mongoose, MongoDB

Runs on port `3000`.

### API

| Method | Endpoint                 | Description          |
| ------ | ------------------------ | -------------------- |
| GET    | `/health`                | Service health check |
| POST   | `/orders`                | Create order         |
| GET    | `/orders/{id}`           | Get order            |
| GET    | `/orders/user/{user_id}` | Get user's orders    |

MongoDB is used for flexible document-based storage of orders and nested order items.

---

## 3. User Service

**Technology:** Node.js, Express.js, bcryptjs, JWT, Redis

Runs on port `4000`.

### API

| Method | Endpoint    | Description                  |
| ------ | ----------- | ---------------------------- |
| GET    | `/health`   | Service health check         |
| POST   | `/register` | Register user                |
| POST   | `/login`    | Authenticate user            |
| GET    | `/profile`  | Access authenticated profile |

Passwords are hashed using **bcrypt**, while **JWT** provides stateless authentication. Redis stores login sessions with a one-hour expiration.

> Note: the current implementation keeps the user credentials in application memory rather than a persistent user database.

---

## 4. Notification Service

**Technology:** Python, FastAPI, Pydantic

Runs on port `5000`.

### API

| Method | Endpoint  | Description                |
| ------ | --------- | -------------------------- |
| GET    | `/health` | Service health check       |
| POST   | `/notify` | Process notification event |

The service accepts an event, user ID, order ID and email and generates the appropriate notification message.

---

#  Nginx API Gateway

Nginx acts as the reverse proxy between the frontend and backend services.

```text
/products  → Product Service
/orders    → Order Service
/users/*   → User Service
/notify    → Notification Service
```

The frontend communicates through Nginx instead of directly connecting to every backend service.

Gateway health check:

```text
GET /health
```

---

# 🐳 Docker

Every microservice has its own `Dockerfile`, allowing services to be built and deployed independently.

Docker Compose orchestrates:

* PostgreSQL
* MongoDB
* Redis
* Product Service
* Order Service
* User Service
* Notification Service
* Nginx
* Prometheus
* Grafana

Start the complete local stack:

```bash
docker compose up --build
```

Stop the stack:

```bash
docker compose down
```

---

#  Kubernetes

Kubernetes manifests are provided under the `k8s/` directory.

Each service has its own:

* Deployment
* Kubernetes Service
* Container configuration
* Health/readiness configuration

Product Service is configured with **2 replicas**.

A Horizontal Pod Autoscaler is configured for Product Service:

```text
Minimum replicas: 2
Maximum replicas: 8
CPU target: 70%
```

The Product Service also uses a Kubernetes readiness probe against:

```text
/health
```

This prevents Kubernetes from routing traffic to a pod until the service is ready.

---

# ☁️ AWS Infrastructure with Terraform

The project uses **Terraform** for Infrastructure as Code.

Infrastructure is divided into:

```text
terraform/
├── vpc/
├── eks/
├── rds/
└── redis/
```

### AWS Resources

* Amazon VPC
* Public subnets across two availability zones
* Internet Gateway
* Amazon EKS cluster
* EKS managed node group
* Amazon RDS PostgreSQL
* Amazon ElastiCache Redis
* IAM roles and policies
* Security groups

The EKS node group is configured with:

```text
Instance type: t3.medium
Desired nodes: 2
Minimum nodes: 2
Maximum nodes: 6
```

This provides the cloud infrastructure required to run the Kubernetes-based application.

---

# 🔄 CI/CD with Jenkins

The project includes a Jenkins pipeline defined in:

```text
jenkins/Jenkinsfile
```

Pipeline stages:

```text
Checkout
   ↓
Lint
   ↓
Build Docker Images
   ↓
Smoke Tests
   ↓
Deploy to Kubernetes
   ↓
Deployment Verification
```

The pipeline:

1. Checks out source code.
2. Performs Python linting.
3. Builds Docker images for all backend services.
4. Runs basic service smoke tests.
5. Deploys Kubernetes manifests.
6. Waits for Kubernetes deployments to roll out.
7. Verifies running pods.

---

# 📊 Monitoring

The project uses **Prometheus** for metrics collection and **Grafana** for visualization.

Prometheus is configured to scrape:

```text
Product Service
Order Service
Notification Service
```

with a scrape interval of:

```text
15 seconds
```

Grafana runs on:

```text
http://localhost:3001
```

Prometheus runs on:

```text
http://localhost:9090
```

---

# 🧪 Load Testing

The project includes a **k6** load-testing script:

```text
load-test.js
```

The script can be used to generate traffic against application APIs and evaluate how the services behave under increasing load.

This can be combined with Kubernetes HPA and Prometheus/Grafana to observe application performance and scaling behavior.

---

# 📁 Project Structure

```text
retailflow-main/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── App.js
│   │   └── App.css
│   └── package.json
│
├── services/
│   ├── product-service/
│   │   ├── app/
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   │
│   ├── order-service/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── user-service/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── notification-service/
│       ├── app/
│       ├── Dockerfile
│       └── requirements.txt
│
├── nginx/
│   └── nginx.conf
│
├── k8s/
│   ├── deployments/
│   ├── services/
│   └── hpa/
│
├── terraform/
│   ├── vpc/
│   ├── eks/
│   ├── rds/
│   └── redis/
│
├── monitoring/
│   └── prometheus/
│
├── jenkins/
│   └── Jenkinsfile
│
├── docker-compose.yml
├── load-test.js
└── Dockerfile
```

---

# 🛠️ Technology Stack

| Category                | Technologies                  |
| ----------------------- | ----------------------------- |
| Frontend                | React.js, Axios, React Router |
| Product Service         | Python, FastAPI               |
| Order Service           | Node.js, Express.js           |
| User Service            | Node.js, Express.js           |
| Notification Service    | Python, FastAPI               |
| Relational DB           | PostgreSQL                    |
| NoSQL DB                | MongoDB                       |
| Cache/Session Store     | Redis                         |
| ORM                     | SQLAlchemy                    |
| MongoDB ODM             | Mongoose                      |
| Authentication          | JWT, bcrypt                   |
| API Gateway             | Nginx                         |
| Containers              | Docker                        |
| Local Orchestration     | Docker Compose                |
| Container Orchestration | Kubernetes                    |
| Autoscaling             | Kubernetes HPA                |
| Cloud                   | AWS                           |
| Infrastructure as Code  | Terraform                     |
| CI/CD                   | Jenkins                       |
| Monitoring              | Prometheus, Grafana           |
| Load Testing            | k6                            |

---

# ▶️ Running Locally

### Prerequisites

Install:

* Docker
* Docker Compose
* Node.js
* Python
* Kubernetes/Minikube *(for Kubernetes deployment)*
* Terraform *(for AWS infrastructure)*
* Jenkins *(for CI/CD pipeline)*
* k6 *(for load testing)*

### Start the application

```bash
git clone <repository-url>
cd retailflow-main

docker compose up --build
```

The main services will be available through:

```text
Frontend:       http://localhost
Product API:    http://localhost/products
Order API:      http://localhost/orders
User API:       http://localhost/users
Notification:   http://localhost/notify
Prometheus:     http://localhost:9090
Grafana:        http://localhost:3001
```
