# scim-service-ui

A React single-page application that provides a read-only dashboard for a SCIM 2.0 identity provisioning backend. It surfaces users, groups, certification campaigns, audit logs, and provisioning events through a clean sidebar-driven UI.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| UI primitives | Radix UI (Dialog, Dropdown, Select) |
| Icons | Lucide React |
| HTTP | axios (pinned to `^1.14.0` — see [Security](#security)) |
| Routing | React Router DOM v7 |
| Dates | date-fns |

## Project Structure

```
src/
  lib/
    api.ts          # axios instance — base URL, Bearer token, 401 redirect
    utils.ts        # cn() helper (clsx + tailwind-merge)
  types/
    scim.ts         # TypeScript types: ScimUser, ScimGroup, AuditLog, etc.
  components/
    Layout.tsx      # Sidebar nav + <Outlet>
    ui/             # Reusable primitives: Badge, Button, Card, Input
  pages/
    Login.tsx               # JWT token entry form
    UserDirectory.tsx       # Paginated, filterable user list
    GroupDirectory.tsx      # Group list with member counts
    CertificationCampaigns.tsx  # Access review campaigns
    AuditLog.tsx            # Provisioning audit trail
    ProvisioningTimeline.tsx    # Provisioning events feed
  App.tsx           # Route definitions
  main.tsx          # React entry point
```

## Routes

| Path | Page | Description |
|---|---|---|
| `/login` | Login | Paste a signed JWT to authenticate |
| `/users` | User Directory | Browse and search SCIM users |
| `/groups` | Group Directory | Browse SCIM groups |
| `/campaigns` | Certification Campaigns | Access review decisions |
| `/audit` | Audit Log | SCIM operation audit trail |
| `/events` | Provisioning Events | Real-time provisioning event feed |

Unauthenticated routes (no token in `localStorage`) redirect to `/login` via a 401 interceptor.

## Authentication

The app uses a **JWT Bearer token** flow:

1. User pastes a signed JWT (requires `scope: scim:provision`) on the Login page.
2. Token is stored in `localStorage` under the key `scim_token`.
3. Every outbound API request gets `Authorization: Bearer <token>` injected by an axios request interceptor.
4. A 401 response clears the token and hard-redirects to `/login`.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080` | Base URL for the SCIM backend |

Copy `.env.example` to `.env` for local development:

```bash
cp .env.example .env
```

In production (ECS behind an ALB), `VITE_API_BASE_URL` is set to an empty string so that API calls like `/scim/v2/Users` resolve same-origin via the load balancer.

## Local Development

**Prerequisites:** Node 22+

```bash
npm install
npm run dev        # Vite dev server at http://localhost:5173
```

Other scripts:

```bash
npm run build      # TypeScript check + production Vite build → dist/
npm run preview    # Serve the dist/ build locally
npm run lint       # ESLint
```

## Docker

Multi-stage build — Node 22 Alpine compiles the app, nginx:alpine serves it.

```bash
# Build
docker build --build-arg VITE_API_BASE_URL=http://your-backend:8080 -t scim-service-ui .

# Run
docker run -p 8080:80 scim-service-ui
```

The image exposes port 80. Pass `VITE_API_BASE_URL` as a build argument; leave it empty for same-origin deployments.

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) triggers on every push to `main`:

| Job | Steps |
|---|---|
| **Build & type-check** | `npm ci` → `tsc -b` → `vite build` → upload `dist/` artifact |
| **Docker → ECR → ECS** | Build image → push to Amazon ECR → update ECS task definition → deploy |

## SCIM Compliance

The API client sets `Content-Type: application/scim+json` and `Accept: application/scim+json` on all requests, conforming to [RFC 7643](https://www.rfc-editor.org/rfc/rfc7643) and [RFC 7644](https://www.rfc-editor.org/rfc/rfc7644).
