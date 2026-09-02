# URL Shortener

A lightweight URL-shortening backend built with Node.js, Express, MongoDB, Redis, and Nano ID.

The service creates seven-character Base62 short codes, stores URL mappings in MongoDB, and caches redirect targets in Redis for one hour.

## Features

- Create a short URL from an original URL.
- Return the existing short code when the same URL is submitted again.
- Redirect short codes to their original URLs.
- Cache redirect targets in Redis with a 1-hour expiration.
- Retry MongoDB and Redis connections during startup.
- Support a standalone Redis instance or Redis Cluster.

## Project Structure

```text
urlshortner/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── redis.js
│   ├── controllers/
│   │   └── urlShortnerController.js
│   ├── model/
│   │   └── urlDetails.js
│   ├── utility/
│   │   └── shortUrl.js
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
└── README.md
```

## Requirements

- Node.js 18 or newer
- MongoDB
- Redis

MongoDB and Redis must be running before starting the backend. The application retries each service connection up to 10 times, waiting 3 seconds between attempts.

## Getting Started

From the `backend` directory:

```bash
npm install
npm run dev
```

The server starts at [http://localhost:3000](http://localhost:3000).

A successful startup prints connection messages for MongoDB and Redis, followed by the server URL.

## Configuration

All settings are optional. The defaults support local MongoDB and Redis installations.

| Variable | Default | Description |
| --- | --- | --- |
| `MONGO_URL` | `mongodb://localhost:27017/urlshortner` | MongoDB connection string |
| `REDIS_HOST` | `127.0.0.1` | Redis host for standalone mode |
| `REDIS_PORT` | `6379` | Redis port for standalone mode |
| `REDIS_CLUSTER_NODES` | unset | Comma-separated Redis Cluster nodes, such as `redis-1:6379,redis-2:6379` |

When `REDIS_CLUSTER_NODES` is set, it takes precedence over `REDIS_HOST` and `REDIS_PORT`.

Example PowerShell configuration:

```powershell
$env:MONGO_URL = "mongodb://localhost:27017/urlshortner"
$env:REDIS_HOST = "127.0.0.1"
$env:REDIS_PORT = "6379"
npm run dev
```

## API

### Health Check

```http
GET /
```

Response:

```text
URL shortener backend is running
```

### Create a Short URL

```http
POST /shorten
Content-Type: application/json
```

Request body:

```json
{
  "originalUrl": "https://example.com/a-long-page"
}
```

Successful response for a new URL (`201 Created`):

```json
{
  "shortCode": "Ab3xYz9",
  "shortUrl": "http://localhost:3000/Ab3xYz9"
}
```

Submitting an already stored `originalUrl` returns the existing mapping with `200 OK`.

If `originalUrl` is missing, the service returns `400 Bad Request`:

```json
{
  "error": "originalUrl is required"
}
```

Example with `curl`:

```bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl":"https://example.com/a-long-page"}'
```

### Redirect to the Original URL

```http
GET /:shortCode
```

Example:

```bash
curl -i http://localhost:3000/Ab3xYz9
```

A known short code returns an HTTP redirect to the original URL. An unknown short code returns `404 Not Found`:

```json
{
  "error": "URL not found"
}
```

## Data Model

Each URL mapping contains:

- `originalUrl`: the original URL, required and unique.
- `shortCode`: the seven-character Base62 code, required and unique.
- `createdAt` and `updatedAt`: timestamps managed by Mongoose.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the backend with Node.js |
| `npm test` | Placeholder script; automated tests are not currently configured |

## Notes

- The backend currently listens on port `3000`; this port is defined in `backend/index.js`.
- Redis cache keys use the format `shortUrl:<shortCode>` and expire after 3600 seconds.
- The current API checks that `originalUrl` is present but does not perform additional URL-format validation.
- No frontend application is included in this repository; the backend can be consumed by a browser, CLI, or separate client.
