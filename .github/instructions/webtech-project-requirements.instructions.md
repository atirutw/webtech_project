---
description: "Use when implementing or modifying this music store project (backend, frontend, or API docs). Enforces required features, RBAC rules, and response/documentation expectations from course requirements."
name: "Webtech Project Requirements"
applyTo: "backend/**, frontend/**, README.md, requirements.md"
---
# Webtech Project Requirements

Treat these as hard requirements for this workspace.

## Feature Coverage

- Keep Product features complete:
  - View all products for Member and Admin.
  - View product details for Member and Admin.
  - Add and edit products for Admin only.
- Keep Member features complete:
  - Register and login for Member and Admin users.
  - Member can edit personal profile.
  - Admin can change member status and promote users to Admin.
- Keep Transaction features complete:
  - Member can place or confirm orders.
  - Member and Admin can view transaction details.
  - Member and Admin can view purchase history per user.

## Cart and Order Rules

- While an order is not confirmed, Member can remove an item or clear the cart.
- After order confirmation, item removal and cart clearing are not allowed.
- Never implement flows that allow post-confirmation cart edits.

## RBAC and Security

- Enforce role-based access control on every protected endpoint and UI action.
- Admin-only actions must be inaccessible to Member users in both API and UI.
- Member users must not be allowed to create or edit product information.
- For admin-only frontend features, enforce both:
  - hide or disable restricted UI actions for non-admin users, and
  - route-guard or navigation blocking so non-admin users cannot access admin pages directly.

## API and Documentation

- Keep REST API contracts aligned with frontend usage.
- Treat the backend online docs route (Swagger/OpenAPI) as the primary API documentation source.
- For every endpoint, provide or update online API documentation with:
  - What the endpoint does.
  - Parameters.
  - Returned data.
  - Example request.
  - Example response.
- If endpoint behavior changes, update docs in the same task.

## Backend and Data Constraints

- Backend stack assumptions: Node.js, Express.js, PostgreSQL.
- Prefer service and repository layering already used in backend source.
- Keep database changes safe and consistent with existing schema and seed flows.

## Delivery Quality

- Do not ship partial features that violate the requirements above.
- When adding features, include minimal validation and error handling paths.
- Keep behavior consistent between backend authorization and frontend visibility.
