# FleetFlow — Logistics Shipment Platform

FleetFlow is a local-first logistics operations platform built with React + TypeScript, Spring Boot microservices, PostgreSQL, RabbitMQ, Redis and Docker Compose.

## Architecture

- React frontend: `http://localhost:3000`
- API Gateway: `http://localhost:8080`
- Auth service: `8081`
- Customer service: `8082`
- Order service: `8083`
- Warehouse service: `8084`
- Shipment service: `8085`
- Tracking service: `8086`
- Notification service: `8087`
- Swagger UI: `http://localhost:8081/swagger-ui.html` through `http://localhost:8087/swagger-ui.html` (each service is bound to loopback for local testing)
- PostgreSQL: `5432` (separate logical database per service)
- RabbitMQ management: `http://localhost:15672`
- Redis: `6379`

## Start locally

Requirements: Docker Desktop with Docker Compose v2.

```powershell
Copy-Item .env.example .env
# Start the complete stack (first run builds the Java and frontend images)
docker compose up -d --build
# Follow service startup
docker compose ps
docker compose logs -f api-gateway
```

Open `http://localhost:3000`, create a user account and sign in. The default registration role is `USER`.

To promote a local account to administrator for development/testing only:

```powershell
docker compose exec postgres psql -U logistics -d authdb -c "UPDATE users SET role='ADMIN' WHERE email='your-email@example.com';"
```

Sign out and sign in again to obtain a JWT containing the updated role.

## Main API routes

| Service | Gateway route |
|---|---|
| Auth | `/api/auth/**`, `/api/users/**` |
| Customer | `/api/customers/**` |
| Order | `/api/orders/**` |
| Warehouse | `/api/warehouses/**` (reservation requests: `/api/warehouses/reservations`) |
| Shipment | `/api/shipments/**` |
| Tracking | `/api/tracking/**` |
| Notification | `/api/notifications/**` |

## Event flow implemented

1. Order Service persists a shipment order and publishes `order.created` to the durable `logistics.events` topic exchange.
2. Warehouse Service consumes the event and records an inventory reservation request.
3. Shipment Service consumes the event, creates a shipment and tracking code, then publishes `shipment.created`.
4. Tracking Service consumes `shipment.created` and creates the initial `ORDER_CREATED` tracking event.
5. Notification Service consumes `order.created` and stores an in-app notification record.

The consumers are idempotent for warehouse reservation and shipment creation, and the initial tracking event checks for an existing matching tracking code/status. This is a starter event workflow, not yet a production-grade transactional outbox implementation.

## Security policy

- Registration creates `USER` accounts.
- JWTs are validated by each protected business service using the same shared secret.
- `USER` can read operational data and create orders/shipments/tracking events.
- `ADMIN` is required for update/delete operations; warehouse and notification writes are admin-only through public APIs.
- Local `.env` credentials are for development only. Replace passwords and JWT secret before any shared or cloud deployment.

## Current implementation boundaries

This repository is being completed incrementally. The current event flow records a warehouse reservation request, but real stock allocation still requires SKU-level inventory, quantity, warehouse selection, locking and release/commit rules. Notification Service currently records in-app notifications; SMTP/SMS provider delivery is not configured. Redis caching is currently enabled for Customer read operations. A transactional outbox, dead-letter queues, retry/backoff policy, distributed tracing, comprehensive integration tests and end-to-end browser tests remain follow-up hardening work.

## Smoke test

After the containers are healthy, run the end-to-end API smoke test from PowerShell:

```powershell
.\scripts\smoke-test.ps1
```

It registers a temporary user, creates a customer and order, then verifies that RabbitMQ consumers create a shipment, initial tracking event and in-app notification.

## Useful commands

```powershell
# Inspect all containers
docker compose ps

# Tail one service
docker compose logs -f order-service

# Restart after code/config changes
docker compose up -d --build order-service shipment-service tracking-service warehouse-service notification-service api-gateway frontend

# Stop containers but keep local data
docker compose down

# Reset all local databases and Redis data (destructive)
docker compose down -v
```
