# Intelligence Worker Deployment Documentation

## Overview
The intelligence worker is deployed on Render as a persistent **Background Worker** process.
It polls RSS feeds, enriches items using Groq, and writes to MongoDB. Upstash Redis is used for distributed locking to prevent duplicate processing if multiple instances are run.

## Render Configuration
- **Service Type**: Background Worker
- **Repository**: `mukundjha728-dotcom/global-chanakya`
- **Branch**: `main`
- **Build Command**: `pnpm install --frozen-lockfile`
- **Start Command**: `pnpm worker:intelligence`
- **Schedule**: None (Persistent Process)
- **Health Checks**: None required.

## Environment Variables

### REQUIRED
These must be set in the Render dashboard:
- `MONGODB_URI`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `GROQ_API_KEY_1` (at least one key is required)
- `GROQ_DEFAULT_MODEL`
- `INTELLIGENCE_POLL_INTERVAL_MS` (set to `720000` for 12 minutes)

### OPTIONAL
- `GROQ_API_KEY_2`
- `GROQ_API_KEY_3`
- `GROQ_API_KEY_4`

*Note: Do not include Next.js specific or Vercel specific variables here.*
