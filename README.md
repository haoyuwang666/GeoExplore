# GeoExplore

GeoExplore turns a world map into an interactive travel guide. Instead of browsing destinations through a long list, visitors can move around the globe, select a map marker, and immediately discover what makes that place worth exploring.

The project combines geographic exploration, curated destination information, personal collections, and traveler knowledge in one application. It currently includes 53 landmarks and natural destinations across the world, with no third-party API key required to run it.

## The GeoExplore experience

**Explore → Discover → Save → Share**

1. **Explore the globe.** Pan and zoom around the interactive world map or search for a destination by name or country.
2. **Discover a place.** Select a marker to preview a destination, then open its full page for descriptions, practical details, ratings, and photographs.
3. **Build a personal collection.** Create an account and save interesting destinations so they are easy to revisit from the profile page.
4. **Learn from travelers.** Read comments and practical tips organized into general, photography, transportation, timing, and safety categories.
5. **Contribute responsibly.** Signed-in users can publish comments and tips, while ownership rules ensure they can edit or delete only their own contributions.

## Core components

| Component | What it does |
| --- | --- |
| World explorer | Renders the MapLibre map, destination markers, search, filtering, and map navigation |
| Destination catalog | Provides the curated place data, geographic coordinates, descriptions, galleries, ratings, and attribution links |
| Place details | Brings destination information, saved status, comments, and categorized tips into one focused view |
| Accounts and profiles | Handles registration, sign-in, sign-out, authenticated sessions, and each user's saved places |
| Community layer | Lets travelers publish, update, and remove their own comments and tips |
| REST API | Applies validation, security, ownership rules, and application logic between the browser and database |
| PostgreSQL storage | Persists destinations, accounts, saved places, comments, and tips through versioned Flyway migrations |

At a high level, the application has three cooperating layers:

```text
React + MapLibre interface
           │
           │  HTTP / JSON
           ▼
Spring Boot REST API
           │
           │  JPA + Flyway
           ▼
PostgreSQL database
```

## Features

- Interactive MapLibre world map with searchable destinations
- 53 seeded places with descriptions, metadata, galleries, and attribution links
- Account registration, login, logout, and persistent saved places
- Traveler comments with edit and delete controls for their authors
- Categorized tips: general, photography, transportation, timing, and safety
- Responsive React interface
- PostgreSQL persistence managed by versioned Flyway migrations
- Session authentication, BCrypt password hashing, CSRF protection, CORS restrictions, and request rate limits

## Technology

| Area | Technology |
| --- | --- |
| Frontend | React 18, Vite 6, Axios, MapLibre GL, Lucide React |
| Backend | Java 21, Spring Boot 4.1, Spring Security, Spring Data JPA |
| Database | PostgreSQL 17, Flyway |
| Tooling | Maven, pnpm, ESLint, GitHub Actions, Docker Compose |

During local development, the browser calls the Spring Boot API through Vite's `/api` proxy. The API owns authentication and application logic, while PostgreSQL remains the source of truth for application data.

## Prerequisites

Install the following tools:

- Java Development Kit 21
- Maven 3.9 or newer
- Node.js 22 LTS
- pnpm 11 (Corepack can install it)
- PostgreSQL 16 or newer, or Docker Desktop/Engine with Compose

## Quick start

### 1. Configure local settings

From the repository root:

```bash
cp .env.example .env
```

Edit `.env` and set `POSTGRES_PASSWORD` and `DB_PASSWORD` to the same local password. The real `.env` file is ignored by Git; do not commit it.

### 2. Start PostgreSQL

The easiest option is Docker:

```bash
docker compose up -d postgres
docker compose ps
```

The named Docker volume keeps the database between restarts. Flyway creates the schema and seeds the place catalog when the backend first starts.

To use an existing PostgreSQL installation instead, create the role and database with values matching `.env`:

```sql
CREATE USER geoexplore_app WITH PASSWORD 'your_local_password';
CREATE DATABASE geoexplore OWNER geoexplore_app;
```

Then set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` in `.env`. For a database on another machine, for example:

```properties
DB_URL=jdbc:postgresql://database-host:5432/geoexplore
DB_USERNAME=geoexplore_app
DB_PASSWORD=your_local_password
```

### 3. Start the backend

Open a terminal at the repository root:

```bash
cd backend
mvn spring-boot:run
```

The API starts at `http://localhost:8080`. On startup, Flyway applies every missing migration and Hibernate validates the resulting schema.

### 4. Start the frontend

Open a second terminal:

```bash
cd frontend
corepack enable
pnpm install
pnpm dev
```

Open `http://localhost:5173` in a browser.

## Environment variables

| Variable | Purpose | Local example/default |
| --- | --- | --- |
| `POSTGRES_DB` | Database created by Docker | `geoexplore` |
| `POSTGRES_USER` | PostgreSQL role created by Docker | `geoexplore_app` |
| `POSTGRES_PASSWORD` | Password used while creating the Docker database | Set in `.env` |
| `POSTGRES_PORT` | Host port exposed by Docker | `5432` |
| `DB_URL` | JDBC connection URL used by Spring | `jdbc:postgresql://localhost:5432/geoexplore` |
| `DB_USERNAME` | Database login used by Spring | `geoexplore_app` |
| `DB_PASSWORD` | Database password used by Spring | Same as `POSTGRES_PASSWORD` |
| `SERVER_PORT` | Backend HTTP port | `8080` |
| `SESSION_TIMEOUT` | Inactive HTTP-session lifetime | `12h` |
| `SESSION_COOKIE_SECURE` | Only send the session cookie over HTTPS | `false` locally; `true` in production |
| `ALLOWED_ORIGINS` | Comma-separated frontend origins allowed by CORS | Local Vite origins |
| `RATE_LIMIT_WINDOW_SECONDS` | Rate-limit window | `60` |
| `RATE_LIMIT_AUTH_ATTEMPTS` | Login/register attempts per client and window | `10` |
| `RATE_LIMIT_COMMUNITY_WRITES` | Comment/tip writes per user and window | `40` |
| `VITE_API_BASE_URL` | Browser API base path | `/api` |

Spring loads `.env` whether Maven is launched from the repository root or from `backend`. Vite also loads the root file, but only variables prefixed with `VITE_` are exposed to browser code.

## Database lifecycle

Migration files live in `backend/src/main/resources/db/migration`. Never edit a migration that has already been applied; add the next numbered migration instead.

Useful Docker commands:

```bash
# Stop PostgreSQL without deleting its data
docker compose stop postgres

# Start it again
docker compose up -d postgres

# Follow database logs
docker compose logs -f postgres
```

For a completely fresh local database, run `docker compose down -v` and start it again. This permanently deletes the local GeoExplore Docker database volume.

## Checks and tests

Run the same checks used by GitHub Actions:

```bash
cd backend
mvn test
```

```bash
cd frontend
pnpm install --frozen-lockfile
pnpm lint
pnpm build
```

## API overview

All endpoints are below `/api/v1`.

| Area | Endpoints |
| --- | --- |
| Places | `GET /places`, `GET /places/{id}` |
| Authentication | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/csrf` |
| Current user | `GET /users/me`, `PUT /users/me/likes/{placeId}`, `DELETE /users/me/likes/{placeId}` |
| Comments | `GET/POST /places/{placeId}/comments`, `PATCH/DELETE /comments/{commentId}` |
| Tips | `GET/POST /places/{placeId}/tips`, `PATCH/DELETE /tips/{tipId}` |

Unsafe requests use the CSRF token returned by `/auth/csrf`. Axios handles that token automatically in the included frontend.

## Repository layout

```text
GeoExplore/
├── .github/workflows/ci.yml       GitHub checks
├── backend/                       Spring Boot API
│   └── src/main/resources/
│       └── db/migration/          Flyway schema and seed data
├── frontend/                      React/Vite app
├── .env.example                   Safe configuration template
├── compose.yaml                   Local PostgreSQL service
└── README.md
```

## Production notes

Before deploying publicly:

- Use a strong, unique database password supplied by the hosting platform.
- Serve the site over HTTPS and set `SESSION_COOKIE_SECURE=true`.
- Restrict `ALLOWED_ORIGINS` to the deployed frontend URL.
- Use a persistent managed PostgreSQL database and retain backups.
- Route `/api` to the backend through the same domain, or configure the frontend API base URL for the deployment.
- Run the backend tests and frontend lint/build checks before release.

Sessions and rate limits are stored in the backend process for this single-instance application. Restarting the backend clears them, and multiple backend instances would not share them. A shared persistence layer can be introduced later if the application is scaled horizontally.
