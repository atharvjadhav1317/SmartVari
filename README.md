# SmartVari

**Predict needs. Move resources. Serve every Warkari.**

SmartVari is a website-first service and resource-management platform for the Pandharpur Wari. It is intended to help coordinate food, water, medical assistance, accommodation, transport, volunteers, and other resources across the Wari route.

## Roles

- **Warkari:** Finds services, creates requests, sends SOS alerts, and confirms delivery.
- **Dindi Leader:** Manages a Dindi, group needs, location sharing, alerts, and group requests.
- **Service Provider:** Manages availability, stock, capacity, shifts, and service delivery tasks.
- **Admin / Control Room:** Oversees users, providers, zones, requests, emergencies, inventory, and recommendations.

## High-level architecture

- `frontend/` contains the React client and service abstraction layers.
- `backend/` contains the FastAPI server, domain services, schemas, and persistence boundaries.
- `ai/` contains isolated data, preprocessing, modeling, and prediction areas.
- `docs/` contains architecture and domain documentation.

The frontend communicates with the backend through service/API abstractions. Database, realtime, and AI concerns remain isolated behind their respective backend layers.

## Technology stack

- Frontend: React, Vite, TypeScript, Tailwind CSS
- Maps: Leaflet and OpenStreetMap
- Backend: FastAPI and Python
- Database direction: PostgreSQL and PostGIS
- Realtime direction: WebSockets
- AI direction: Pandas, NumPy, scikit-learn, Random Forest, and XGBoost
- Deployment direction: Vercel, Render/Railway, and Supabase

## Current project phase

This repository is currently in the **architecture foundation phase**. Only the initial structure, documentation, and configuration placeholders are present. Application functionality has intentionally not been implemented yet.
