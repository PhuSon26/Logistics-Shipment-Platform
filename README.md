# Logistics & Shipment Management Platform

A local-first microservices application built with Java 21, Spring Boot, React + TypeScript,
PostgreSQL, RabbitMQ, Redis, Docker Compose and OpenAPI.

# Application
Frontend: React + TypeScript + Vite.
Backend: Java 21 + Spring Boot, Maven.
8 services: API Gateway, Auth, Customer, Order, Warehouse, Shipment, Tracking, Notification.
Database: PostgreSQL, mỗi business service có database riêng.
Message Broker: RabbitMQ.
Cache: Redis.
API documentation: Swagger / OpenAPI.
Local development: Docker Compose để chạy toàn bộ hệ thống trước khi đưa lên Kubernetes và AWS.

## Services

| Service | Port | Responsibility |
|---|---:|---|
| API Gateway | 8080 | Single entry point and routing |
| Auth Service | 8081 | Authentication foundation and user endpoints |
| Customer Service | 8082 | Customer management |
| Order Service | 8083 | Shipment order management |
| Warehouse Service | 8084 | Warehouse and inventory management |
| Shipment Service | 8085 | Shipment lifecycle |
| Tracking Service | 8086 | Tracking events |
| Notification Service | 8087 | Notification records |

## Prerequisites

- Docker Desktop with Docker Compose
- Java 21 and Maven (only if running services outside Docker)
- Node.js 20+ (only if running frontend outside Docker)

## Start infrastructure and services

```bash
docker compose up --build -d
docker compose ps
```

Frontend: http://localhost:5173  
Gateway: http://localhost:8080  
RabbitMQ management: http://localhost:15672 (`logistics` / `logistics123`)  
PostgreSQL: localhost:5432 (`logistics` / `logistics123`)  
Redis: localhost:6379

Swagger UI for each service (service ports are published for local development):
- Auth: http://localhost:8081/swagger-ui.html
- Customer: http://localhost:8082/swagger-ui.html
- Order: http://localhost:8083/swagger-ui.html
- Warehouse: http://localhost:8084/swagger-ui.html
- Shipment: http://localhost:8085/swagger-ui.html
- Tracking: http://localhost:8086/swagger-ui.html
- Notification: http://localhost:8087/swagger-ui.html

## Useful checks

```bash
docker compose ps
curl http://localhost:8080/actuator/health
curl http://localhost:8080/api/users
curl http://localhost:8082/api/customers
curl http://localhost:8083/api/orders
curl http://localhost:8084/api/warehouses
curl http://localhost:8085/api/shipments
curl http://localhost:8086/api/tracking
curl http://localhost:8087/api/notifications
```

## Stop

```bash
docker compose down
```

Remove local database volumes (destructive):
```bash
docker compose down -v
```

## Project status

This is the runnable MVP foundation. It includes independent Spring Boot services,
service-specific PostgreSQL databases, API Gateway routing, RabbitMQ and Redis infrastructure,
and a React dashboard. Production-grade JWT authorization, complete business workflows,
outbox/retry/dead-letter handling, automated tests, Kubernetes manifests and CI/CD are planned
as subsequent implementation milestones.

## Repository layout

```text
.
├── backend/
│   ├── pom.xml
│   ├── common/
│   └── services/
├── frontend/
├── infra/
│   └── postgres/
└── docker-compose.yml
```
