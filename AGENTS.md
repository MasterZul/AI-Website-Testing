# AGENTS.md - AI Coding Agent Guidelines

## Project Architecture

This is a **full-stack web application** combining a Spring Boot backend with a React/TypeScript/Vite frontend.

- **Backend**: `src/main/java/` - Spring Boot 3.3.6 REST API serving user data
- **Frontend**: `frontend/src/` - React 19 + TypeScript + Vite SPA with dev proxy to backend
- **Build System**: Maven (backend) + npm (frontend) - build independently

### Key Integration Point

The frontend's Vite dev server proxies `/users` requests to `http://localhost:8080` (see `frontend/vite.config.ts` lines 8-12). The backend serves this endpoint via `UserController.java` at `GET /users`.

**Critical Pattern**: Frontend components use fetch API with full error handling (see `UserList.tsx` lines 24-45). Backend returns JSON arrays directly, not wrapped objects.

## Critical Workflows

### Local Development (Run Both Simultaneously)

```bash
# Terminal 1: Start Spring Boot backend on port 8080
mvn spring-boot:run

# Terminal 2: Start Vite dev server with React HMR
cd frontend && npm run dev    # Runs on http://localhost:5173
```

### Build for Production

```bash
# Backend creates JAR with embedded server
mvn clean package

# Frontend builds static assets, must run AFTER any changes to type definitions
cd frontend && npm run build  # Output in frontend/dist/
```

### Type Checking & Linting

- Frontend TypeScript strict mode: `cd frontend && tsc -b`
- Frontend linting: `cd frontend && npm run lint` (flat config ESLint 9+)
- No backend linting configured (Java 17 only)

## Project-Specific Conventions

### Data Models

- **User record** (`User.java`): Uses Java record syntax with Long ID. Frontend defines separate interface (`UserList.tsx` lines 3-7) - **do not assume backend models match frontend types exactly**.
- **API Returns**: Direct JSON arrays (e.g., `[{id:1, name:"Alice", ...}]`), not wrapped with pagination/metadata objects.

### React Component Patterns

- Components export interfaces for props (`UserListProps` in `UserList.tsx` lines 9-12)
- Fetch requests include cancellation handling via closure variable (line 20, 48) to prevent memory leaks
- CSS class names use BEM notation: `user-list__status`, `user-list__error` (see `App.css` and `UserList.tsx` styling)
- Accessibility: All interactive UI includes `role` and `aria-live` attributes (lines 54, 62, 70)

### TypeScript Strictness

- TSConfig uses standard project references (`tsconfig.json` references app and node configs)
- ESLint flat config (9+) enforces React Hooks rules and refresh plugin
- No type relaxation pragmas—use explicit types for all function parameters and returns

## Service Boundaries

| Concern | Location | Responsibility |
|---------|----------|-----------------|
| HTTP REST API | `UserController.java` | Route handlers for `/users`, `/countries` endpoints |
| Domain Model | `User.java` | Immutable data record |
| UI Component | `UserList.tsx` | Fetch, state management, accessibility, rendering |
| Styling | `App.css` | Global styles; component CSS follows BEM naming |

## Adding New Features

1. **New Backend Endpoint**: Add method to `UserController.java`, return List or single object (framework auto-serializes to JSON)
2. **New Frontend Component**: Export named function with TypeScript interface for props, use `useEffect` with cancellation, handle error states
3. **Update Frontend API**: Modify `usersUrl` prop in `UserList.tsx` or create new fetch hooks following the cancellation pattern
4. **Cross-team Communication**: Frontend and backend are loosely coupled through HTTP contract only—document JSON shape in comments

## External Dependencies

- **Spring Boot Web** (pom.xml): Provides `@RestController`, auto JSON serialization via Jackson
- **React 19 + React DOM**: Client-side rendering with Hooks API
- **TypeScript 6.0**: Strict type checking
- **Vite 8.0**: Fast builds + dev server with HMR and proxy support
- **ESLint 9 + TypeScript ESLint**: Flat config (not legacy `.eslintrc`)

## Common Gotchas

1. **Port Conflicts**: Backend runs on 8080, Vite on 5173. If running tests or multiple instances, ports may collide.
2. **Type Mismatch**: Backend ID is `Long`, frontend treats as `number`. This works in JSON but matters for strict comparisons—always cast if needed.
3. **CORS**: Vite proxy avoids CORS issues in dev. Production deployment must handle CORS headers or proxy at reverse-proxy layer.
4. **Build Order**: `npm run build` includes `tsc -b` first—don't skip it or stale types may ship.

