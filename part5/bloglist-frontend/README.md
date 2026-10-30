# Full Stack Open Part 5: Bloglist frontend

This React 19/Vite app implements the final routed and Material UI version for exercises 5.1–5.31 against the Part 4 API. It was prepared with Codex AI assistance. Local implementation and test evidence do not imply learner review, new study time, official submission, or a certificate upgrade. The recorded official state remains 97 accepted exercises and grade 3 until the course system confirms otherwise.

## Run locally

Use Node 24.1.0 (`.nvmrc` at the course root). In one terminal, from `part4/bloglist-backend`, run `npm ci` and `npm run demo`. The demo starts an API at `http://127.0.0.1:3003` with a temporary database. In a second terminal, from this directory, run:

```sh
npm ci
npm run dev
```

Open the Vite address printed in the terminal. Vite proxies `/api` to `127.0.0.1:3003`. To use a persistent backend instead, configure Part 4 as described in its README and start it on port 3003. The UI does not register users; create a demo user through `POST /api/users` before logging in.

| Route | Behavior |
| --- | --- |
| `/` | Public blog listing, sorted by descending likes, with links to details |
| `/login` | Login form; successful login returns to `/`; authenticated visits redirect home |
| `/blogs/:id` | Public URL, author, creator and like count; Like requires login, Delete additionally requires ownership |
| `/blogs/new` | Authenticated creation; guests redirect to login; creation and cancellation return home |

Logout and successful deletion return to `/`. Detail and creation routes wait for the current list request; failures offer retry, and unknown blogs show a missing-page message with a link home. The SPA host must serve `index.html` for direct application routes; Vite already does so. The existing API supplies the full list for direct detail lookup.

The frontend preserves validated localStorage sessions, request/session/mutation generations, per-blog mutation guards, pending forms and creator information. Material UI provides the navigation, forms, notifications and detail card. Exact dependency pins were checked against the official npm registry: React Router DOM 7.18.5, Material UI 9.5.0, Emotion React 11.14.0 and Emotion Styled 11.14.1, compatible with React 19 and Node 24.

## Verification

```sh
npm test
npm run lint
npm run build
```

If your shell supplies `NO_COLOR` alongside a forced-color setting, use `env -u NO_COLOR npm test` to remove that inherited conflict instead of hiding warnings. The frontend suite covers route access, direct navigation, ownership controls, form payloads, loading/retry/missing states, redirects, session validation, sorting, mutation failures and late responses across logout/login.

The separate [`../bloglist-e2e`](../bloglist-e2e/README.md) npm project runs real Chromium against this frontend and the disposable Part 4 API. Its config owns backend port 3305 and frontend port 5315 and refuses server reuse. `BLOGLIST_API_TARGET` selects that isolated proxy target; normal development retains the API3003 default. Follow its README for setup and commands.

## Exercise map

Earlier-stage behavior is preserved in Git history where the course explicitly supersedes it with routing. The public [pre-router snapshot 4050797](https://github.com/akmaludinakbar/full-stack-open/commit/40507976d4ffdbb0f02894748f5b2bc3763c05b1) contains the initial expand/hide UI, component tests and Playwright suite, with reset isolation already hardened.

| Exercise | Implementation / evidence |
| --- | --- |
| 5.1 | Login form and authenticated session display; final public list and `/login` replace the original login-first view |
| 5.2 | Validated `bloglistUser` localStorage session, reload and logout |
| 5.3 | Authenticated creation through the blog service |
| 5.4 | Timed success/error notifications, now Material UI alerts |
| 5.5 | Creation opens on demand and closes on success/cancel, now through a route |
| 5.6 | `BlogForm` owns its fields and submits entered values |
| 5.7 | Historical expand/hide details in `4050797`; final linked detail route intentionally supersedes it |
| 5.8 | Like sends a PUT with incremented likes and required blog fields |
| 5.9 | Like responses retain creator information immediately |
| 5.10 | Listing stays in descending order of likes |
| 5.11 | Creator-only Delete and confirmation; API still enforces ownership |
| 5.12 | ESLint flat config and `npm run lint` |
| 5.13 | Historical component test for initially visible title/author and hidden URL/likes in `4050797` |
| 5.14 | Historical View/reveal component test in `4050797` |
| 5.15 | Two sequential Like clicks invoke the supplied handler twice; retained in final component tests |
| 5.16 | `BlogForm.test.jsx` verifies exact entered title, author and URL submitted to `onCreate` |
| 5.17 | Separate Playwright project; initial login-form test in `4050797`, now reached through public navigation |
| 5.18 | Real API user setup, successful login/session reload and failed login/error state |
| 5.19 | Real UI creation visible on the list and after reload |
| 5.20 | Real Like update, observable count wait and persisted result after reload |
| 5.21 | Creator confirms deletion; list/API/reload confirm removal |
| 5.22 | Second user sees Like and creator information without Delete |
| 5.23 | Real UI creates three blogs, likes sequentially and verifies descending order after reload |
| 5.24 | React Router public list/login/navigation; login and logout return to list |
| 5.25 | Blog-title links open individual details; only authenticated visitors see Like |
| 5.26 | Separate authenticated creation route; successful create/delete return to list |
| 5.27 | Final `Blog.test.jsx`: guest details without buttons, nonowner Like, creator Like/Delete |
| 5.28 | Playwright adapted to final routes; retains sorting/ownership and adds guest direct-route checks |
| 5.29 | Material UI `TextField`, `Paper`, `Stack` and `Button` for both forms |
| 5.30 | Material UI navigation, session controls and success/error notifications |
| 5.31 | Material UI detail card, typography, URL and ownership-aware action controls |

Course sources: [login in frontend](https://fullstackopen.com/en/part5/login_in_frontend/), [props.children and component refs](https://fullstackopen.com/en/part5/props_children_and_component_refs/), [testing React apps](https://fullstackopen.com/en/part5/testing_react_apps/), [end-to-end testing](https://fullstackopen.com/en/part5/end_to_end_testing/), and [React Router and UI frameworks](https://fullstackopen.com/en/part5/react_router_ui_frameworks/).

## Learner review

1. Browse the list and reload a detail URL while logged out; explain why mutation controls are absent.
2. Log in, refresh and log out. Explain session validation, token storage and the redirects.
3. Create two blogs, like one until sorting changes, and verify its creator stays visible.
4. Use a second user to check ownership controls and explain why backend authorization is also required.
5. Read the tests for request generations, pending guards, retry behavior and late responses.
6. Compare the full exercise map with the official course text, record actual new study time, and decide what to submit through your own account after the official Part 5 reset process.
