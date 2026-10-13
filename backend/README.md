# GeoExplore API

Spring Boot 4.1 and Java 21 backend for GeoExplore. The project uses Maven, Spring Data JPA, PostgreSQL, and Flyway.

## IntelliJ IDEA

1. Open the `backend` folder or its `pom.xml` in IntelliJ IDEA.
2. Let IntelliJ import the Maven dependencies.
3. Select Java 21 as the Project SDK.
4. Run `GeoExploreApplication`.

The API starts at `http://localhost:8080`.

From a macOS terminal, run it explicitly with Java 21:

```bash
JAVA_HOME=$(/usr/libexec/java_home -v 21) mvn spring-boot:run
```

## Local database

Local configuration is loaded from the repository-root `.env` file. Copy
`.env.example` to `.env` before starting the backend. The development connection is:

- Database: `geoexplore`
- User: `geoexplore_app`
- Port: `5432`

The password is never stored in committed application configuration. Set it through
`DB_PASSWORD`; deployment values must provide `DB_URL`, `DB_USERNAME`, and
`DB_PASSWORD` through the environment or a local `.env` file.

Flyway creates and seeds the schema automatically when the application starts.
The database is the source of truth for the complete place catalog, including
detail-page metadata, photo attribution links, and ordered gallery images.

## Endpoints

- `GET /api/v1/places`
- `GET /api/v1/places/{id}`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/csrf`
- `GET /api/v1/users/me`
- `PUT /api/v1/users/me/likes/{placeId}`
- `DELETE /api/v1/users/me/likes/{placeId}`
- `GET /api/v1/places/{placeId}/comments`
- `POST /api/v1/places/{placeId}/comments`
- `PATCH /api/v1/comments/{commentId}`
- `DELETE /api/v1/comments/{commentId}`
- `GET /api/v1/places/{placeId}/tips`
- `POST /api/v1/places/{placeId}/tips`
- `PATCH /api/v1/tips/{tipId}`
- `DELETE /api/v1/tips/{tipId}`

Authentication uses a hardened HTTP session cookie managed by Spring Security.
Passwords are stored as BCrypt hashes. Unsafe requests require the CSRF token
returned by `GET /api/v1/auth/csrf`. Login and community-writing endpoints are
also protected by a configurable in-memory rate limiter.

User profiles, saved places, traveler comments, and categorized tips are
persisted in PostgreSQL by the `V6__create_user_features.sql` and
`V7__complete_community_features.sql` migrations. Only an item's author can
edit or delete it.

Production settings should override `ALLOWED_ORIGINS`,
`SESSION_COOKIE_SECURE=true`, and the database variables. Rate-limit settings
are available through `RATE_LIMIT_WINDOW_SECONDS`, `RATE_LIMIT_AUTH_ATTEMPTS`,
and `RATE_LIMIT_COMMUNITY_WRITES`.
