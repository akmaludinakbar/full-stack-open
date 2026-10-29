# Full Stack Open Part 5: Bloglist frontend

This React 19/Vite app covers exercises 5.1–5.12 against the Part 4 backend. It was prepared with Codex AI assistance. The learner should inspect and understand the implementation, verify the exercise claims, and decide what to submit through their own course account. No course submission or certificate completion is implied.

## Run locally

Use Node 24.1.0 (`.nvmrc` at the course root). In one terminal, from `part4/bloglist-backend`, run `npm ci` and `npm run demo`. The demo starts an API at `http://127.0.0.1:3003` with a temporary database. In a second terminal, from this directory, run:

```sh
npm ci
npm run dev
```

Open the Vite address printed in the terminal. Vite proxies `/api` to `127.0.0.1:3003`. To use a persistent backend instead, configure Part 4 as described in its README and start it on port 3003. The UI does not register users; create a demo user through `POST /api/users` or the Part 4 API before logging in.

Verification commands:

```sh
npm test
npm run lint
npm run build
```

## Exercise map

| Exercise | Implementation |
| --- | --- |
| 5.1 | Login form when logged out; logged in name and blog list |
| 5.2 | `bloglistUser` session in localStorage; reload and logout |
| 5.3 | Authenticated blog creation through the blog service |
| 5.4 | Timed success and error notifications at the top |
| 5.5 | New blog form opens on demand and closes on success or cancel |
| 5.6 | `BlogForm` owns its form fields and submit behavior |
| 5.7 | Each `Blog` toggles details, including URL, likes, and creator |
| 5.8 | Like sends a PUT with incremented likes and blog fields |
| 5.9 | Like response retains the displayed creator immediately |
| 5.10 | Blogs render in descending order of likes |
| 5.11 | Only the creator sees Delete; confirmation precedes the request |
| 5.12 | ESLint flat config and passing `npm run lint` |

Course sources: [login in frontend](https://fullstackopen.com/en/part5/login_in_frontend/) and [props.children and component refs](https://fullstackopen.com/en/part5/props_children_and_component_refs/). Exercises 5.13 onward are outside this implementation target.

## Learner review

1. Log in, refresh the page, and log out. Explain which values persist and why the password does not.
2. Create two blogs, like one until sorting changes, and check that its creator stays visible without reloading.
3. With two users, check which Delete buttons each can see and confirm deletion is blocked by the backend for nonowners.
4. Compare the exercise map with the linked course text and make your own submission decision.
