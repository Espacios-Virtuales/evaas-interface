# EVAAS Interface audit and transformation

Date: 2026-05-22

## Current architecture

The project already has a useful Angular boundary:

- `core`: authentication, HTTP interceptors, models, services and guards.
- `shared`: reusable UI components and helpers.
- `features`: route-level areas for auth and dashboard.

The current feature layout is partially aligned with the EVAAS ecosystem, but `dashboard` still owns resources and projects internally. A later phase should promote those to first-class feature routes such as `features/resources`, `features/projects`, `features/profile`, `features/onboarding` and `features/clients` when their flows are implemented.

## Findings

- Production configuration risk: API endpoints imported `environment.development` directly, bypassing Angular file replacements.
- Dead/duplicated root component: `AppComponent` coexisted with the bootstrapped `App` component and was not referenced.
- Invalid file naming: `session-watcher.service.ts.ts` forced non-standard imports.
- Incomplete service migration: project provisioning lives in `ProjectsService`, while a spec still targeted `SoftwareService.createProject` and `API.provisions`.
- Type duplication: `RegistrationResponse` was declared twice.
- Model drift: provisioning status/types existed both in `core/models` and `core/types`.
- Debug leakage: login printed credentials/session payloads to the console.
- Service inconsistency: `ResourcesService` built its own base URL instead of using the API endpoint registry.

## Applied changes

- Added canonical `src/environments/environment.ts` and changed production replacement to target it.
- Updated API endpoint registry to import the canonical environment.
- Updated `ResourcesService` and its spec to use `API.integrations.software`.
- Renamed `session-watcher.service.ts.ts` to `session-watcher.service.ts`.
- Enabled `SessionWatcherService` from `app.config.ts` through `provideEnvironmentInitializer`.
- Removed sensitive login debug logs.
- Exported and reused `ApiProvisionResponse` for project creation.
- Aligned project creation spec with `ProjectsService` and `API.project.software`.
- Removed unused `AppComponent`.
- Removed duplicated `RegistrationResponse`.

## Recommended next phases

1. Consolidate `core/types` into `core/models` or rename both into a single `core/contracts` boundary.
2. Split dashboard-owned areas into first-class route features once profile, onboarding and clients screens exist.
3. Define backend DTO contracts for auth refresh, project cards, provisioning jobs and onboarding states.
4. Add route guards for authenticated-only and anonymous-only routes.
5. Replace native `document.getElementById` dialog handling with Angular Material/CDK primitives.
6. Add an API adapter layer if EVAAS Core responses remain different from UI domain models.
