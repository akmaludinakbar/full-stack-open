# Bloglist Playwright tests: exercises 5.17–5.23 and 5.28

This separate npm project tests the final routed Part 5 frontend in real Playwright Chromium against the real Part 4 API. Every test resets its disposable database through the API and creates a synthetic user. There are no mocked application APIs, real credentials, personal browser profiles, or external database connections.

Use Node 24.1.0 (`.nvmrc` at the course root). Install the existing backend/frontend dependencies from their lockfiles, then this project's pinned Playwright package and official Chromium:

```sh
npm ci --prefix ../../part4/bloglist-backend
npm ci --prefix ../bloglist-frontend
npm ci
npm run install:browser
env -u NO_COLOR npm test
```

`npm test` owns both services: API `127.0.0.1:3305` and Vite `127.0.0.1:5315`. Leave these ports free. Playwright refuses to reuse existing servers, runs one worker with no retries, and stops the services after the run. The backend creates a new MongoMemoryServer on loopback with a temporary directory and random JWT secret, overwriting incoming `MONGODB_URI` and `SECRET` before loading the app. SIGINT/SIGTERM and startup failure cleanup close HTTP, disconnect Mongoose, and stop/remove the temporary MongoDB. Nothing connects to Atlas.

The destructive `POST /api/testing/reset` route requires `NODE_ENV=test` plus explicit router injection by the dedicated backend launcher after it owns and connects the temporary MongoDB. The ordinary exported app and `server.js` never expose reset through environment settings alone. The dedicated backend script refuses other modes. Do not inject the reset router into a persistent server. Vite's `BLOGLIST_API_TARGET` points this run at the dedicated API; ordinary development keeps the default API on port 3003.

The final suite checks unexpected browser page errors and console errors on every case. The invalid-login case permits the expected HTTP401 resource message only. `env -u NO_COLOR` normalizes a conflicting inherited color setting without suppressing warnings.

For visible Chromium, use `npm run test:headed`. A failing run retains a trace in ignored `test-results/`; inspect it using `npx playwright show-trace <trace.zip>`. Browser files are Playwright's own downloaded binaries in its cache.

| Exercise | Browser evidence |
| --- | --- |
| 5.17 / 5.28 | Public navigation opens `/login`, with username/password fields and submit button |
| 5.18 | Setup creates a user via API; valid login persists across reload; invalid login shows an alert and leaves the login form available |
| 5.19 | UI creation adds a blog that survives reload |
| 5.20 | UI Like increments the displayed count and persists after reload |
| 5.21 | Creator confirms deletion; UI and real API show removal; reload retains removal |
| 5.22 | A second user sees details and Like but no Delete control |
| 5.23 | Three blogs with one, two, and three sequential likes appear in descending order, including after reload |
| 5.24–5.28 | Login/logout/create/delete redirects; guests can load/reload direct detail URLs without mutation controls; creation guard and missing-detail recovery |

Run backend reset/isolation regression tests from `../../part4/bloglist-backend` with `npm test`; this also checks ordinary-app reset 404 in test mode without deleting seeded data, rejects an injected router outside test mode, rejected non-test server startup, ignored external URI/secret, and clean SIGTERM shutdown.

This is local implementation/test evidence. Learner review, new study time, course submission, and certificate completion remain separate. Exercise 5.28 intentionally adapts the earlier login-first tests to public routes. Historical evidence remains in the public [pre-router snapshot 4050797](https://github.com/akmaludinakbar/full-stack-open/commit/40507976d4ffdbb0f02894748f5b2bc3763c05b1); final frontend evidence and the complete 5.1–5.31 map are in the frontend README.
