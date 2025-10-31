# SkillSprout - Local Mock Backend (Next.js + TypeScript)

This repository is a complete local implementation of the assignment described in the provided assessment. It uses Next.js API routes to implement secure endpoints and mocks AWS services (Cognito, S3, DynamoDB, SQS/Lambda) using in-memory data and local endpoints.

## Goals implemented

1. `GET /api/user/profile` - Validates a Cognito-like JWT and returns user profile (from a mocked DynamoDB).
2. `POST /api/files/prepare-upload` - Validates user and returns a mock pre-signed URL for direct upload to a local mock S3 endpoint.
3. `POST /api/submission/process` - Validates user and enqueues a job; returns HTTP 202 fast and a background worker processes jobs (simulating Lambda/SQS).

## Local setup (quick)

Prerequisites
- Node.js 18+ (tested on 18.x)
- npm 9+
- VS Code (recommended) with ESLint extension

Install

```bash
npm install
```

Copy environment variables

```bash
cp .env.example .env.local
# optionally edit .env.local
```

Run

```bash
npm run dev
```

The API will run on http://localhost:3000.

## Helpful local endpoints

### Create a mock token (Cognito-like)

`POST /api/mock/auth/token`
body JSON: `{ "sub": "user-123", "email":"user@example.com", "name":"Local User" }`

Response: `{ token: "<JWT>" }`

Use this token in Authorization header: `Authorization: Bearer <token>`

### 1) Get user profile

`GET /api/user/profile`
Header: `Authorization: Bearer <token>`

Success: `200 { profile: { id, email, name, ... } }`

Errors: `401` (invalid/missing token), `404` (profile not found)

Example curl

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/mock/auth/token -H "Content-Type: application/json" -d '{"sub":"user-123"}' | jq -r .token)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/user/profile
```

### 2) Prepare upload (pre-signed URL)

`POST /api/files/prepare-upload`
Header: `Authorization: Bearer <token>`
Body JSON: `{ "fileName":"resume.pdf", "contentType":"application/pdf", "size": 12345 }`

Response: `200 { uploadUrl, key, expiresIn }`

Simulated upload

- The `uploadUrl` is a local endpoint that accepts `PUT` or `POST` with the raw file body. You can `curl --data-binary @file` to it.

Example curl to upload file after getting URL

```bash
curl -X POST http://localhost:3000/api/files/prepare-upload \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"fileName":"resume.txt","contentType":"text/plain","size":10}'

# assume response gave uploadUrl
curl -X PUT "$UPLOAD_URL" --data-binary @./resume.txt -H "Content-Type: text/plain"
```

### 3) Submit processing job

`POST /api/submission/process`
Header: `Authorization: Bearer <token>`
Body JSON: `{ "projectId": "proj-abc", "meta": {}}`

Response: `202 { message: 'Processing started', jobId }

Check status
`GET /api/submission/status?jobId=<jobId>`
- `202` pending
- `200` done with result

## How local mocking maps to actual AWS

- Cognito: In production you validate JWTs issued by Cognito using JWKS and the pool's public keys. Locally we sign tokens with a shared secret.
- DynamoDB: Replace the in-memory DB with DynamoDB client calls to `getItem`/`putItem` for the `Profiles` table.
- S3: The pre-signed URL returned should be created by AWS S3 SDK's `getSignedUrl` and will be used directly by the browser to PUT the file to S3. Locally we return a URL to `/api/mock/mock-s3` that accepts uploads.
- SQS / Lambda: In production the API would push messages to SQS and a Lambda or ECS worker would process them. Locally we use an in-memory queue and a background worker.

## Migrating to real AWS (high level)

1. Cognito
   - Create a User Pool and App Client.
   - Use the JWKS endpoint to verify tokens server-side instead of a local secret.

2. DynamoDB
   - Create a `Profiles` table (PK: `id`).
   - Replace `lib/db.ts` functions with calls to AWS SDK `DynamoDBClient` and use typed marshalling.

3. S3
   - Create a bucket and allow `PutObject` with pre-signed URL.
   - Replace `lib/mockAws.createPresignedUrl` with `getSignedUrl` from `@aws-sdk/s3-request-presigner`.

4. SQS / Lambda
   - Create an SQS queue and publish messages via AWS SDK.
   - Hook a Lambda to the queue to process messages; or use an event-driven consumer.

## Testing with Postman

- Create a POST request to `/api/mock/auth/token` to obtain JWT.
- Save `Authorization: Bearer <token>` as environment header.
- Test three main endpoints with that header.

## Notes on security and requirements

- Local tokens are signed with a symmetric secret; real Cognito uses asymmetric keys (RS256). For production, verify signature with JWKS and check `iss`, `exp`, and `aud` claims.
- All endpoints perform minimal validation — expand input validation for production.

## Files included

All server files are included under `pages/api/` and helper modules in `lib/`.

## Linting & VS Code extensions

Recommended extensions:
- ESLint
- Prettier (optional)
- REST Client (optional for direct testing)
- AWS Toolkit (only needed for real AWS deployments)

Run linter:

```bash
npm run lint
```

## Final

This repository is intentionally minimal and focused on the assignment's core expectations: secure JWT validation, S3 pre-signed upload flow, and asynchronous job offload. It is ready for migration to actual AWS services by replacing the mock helper modules with AWS SDK calls.
