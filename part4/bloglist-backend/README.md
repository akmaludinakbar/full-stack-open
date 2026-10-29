# Full Stack Open Part 4: Bloglist backend

This independent Express and Mongoose app is a working implementation for reviewing exercises 4.1–4.23. It was prepared with Codex AI assistance. The learner must inspect, understand, and verify each exercise before deciding what to submit. This repository does not establish course submission or certificate completion.

## Run locally

Use Node 24.1.0 or newer (`.nvmrc` in the course root specifies 24.1.0).

```sh
npm ci
npm test
npm run lint
npm run demo
```

`npm run demo` starts MongoDB bound to `127.0.0.1` with a temporary data directory and a fresh JWT secret. The API listens at `http://127.0.0.1:3003`; stop it with Ctrl+C. The data disappears when the process stops. This demo is separate from any Atlas deployment.

For a persistent database, copy `.env.example` to `.env` and replace the placeholders, then run `npm start` (or `npm run dev` for file watching). `MONGODB_URI` and `SECRET` are required; `PORT` defaults to 3003. Never commit `.env` or credentials. Tests always create their own temporary loopback MongoDB; they do not use `MONGODB_URI` or delete an existing database. The first test run may download a MongoDB binary.

## API

- `GET /api/blogs` and `GET /api/blogs/:id` return blogs with `id`, `title`, `author`, `url`, `likes`, and a populated `user` containing `id`, `username`, `name`.
- `POST /api/users` accepts `{ username, name, password }`; `GET /api/users` returns users with populated `blogs`, with no password hash.
- `POST /api/login` accepts `{ username, password }` and returns `{ token, username, name, id }`.
- `POST /api/blogs` accepts `{ title, author, url, likes }` and requires `Authorization: Bearer <token>`. Missing likes defaults to zero; the authenticated user becomes the creator.
- `PUT /api/blogs/:id` accepts `{ likes }` and returns the updated blog with its original creator.
- `DELETE /api/blogs/:id` requires the creator's token and returns 204.

Invalid input or IDs return 400, absent blogs 404, missing or invalid credentials 401, and deletion by another user 403.

## Exercise map

| Exercise | Implementation and evidence |
| --- | --- |
| 4.1 | Express/Mongoose blog GET and POST routes in `controllers/blogs.js` |
| 4.2 | Separate `app.js`, `server.js`, `controllers`, `models`, and `utils` |
| 4.3 | `dummy` and its unit test |
| 4.4 | `totalLikes` and empty/one/multiple tests |
| 4.5* | `favoriteBlog` and unit test |
| 4.6* | `mostBlogs` and unit test |
| 4.7* | `mostLikes` and unit test |
| 4.8 | SuperTest JSON/count integration test with isolated MongoDB |
| 4.9 | Blog schema `id` serialization and test |
| 4.10 | Authenticated POST persistence integration test |
| 4.11* | Default zero likes and test |
| 4.12* | Missing title/URL 400 and tests |
| 4.13 | DELETE route and owner deletion test |
| 4.14 | PUT likes route and creator-preservation test |
| 4.15 | User POST/GET, bcrypt hash, no hash in responses |
| 4.16* | Username/password validation, unique index, invalid-user tests |
| 4.17 | Blog creator reference and mutual populate tests |
| 4.18 | Login route and JWT authentication test |
| 4.19 | Authenticated blog creation using token identity |
| 4.20* | `tokenExtractor` middleware |
| 4.21* | Owner-only delete, 401/403 tests |
| 4.22* | `userExtractor` middleware on create/delete |
| 4.23* | Authenticated POST tests and explicit no-token 401 test |

Course sources: [backend structure and helpers](https://fullstackopen.com/en/part4/structure_of_backend_application_introduction_to_testing/), [backend testing](https://fullstackopen.com/en/part4/testing_the_backend/), [user administration](https://fullstackopen.com/en/part4/user_administration/), [token authentication and exercises 4.15–4.23](https://fullstackopen.com/en/part4/token_authentication/).

## Learner review

1. Run the tests and use the demo API to register two users, create a blog, update likes, and try deleting as each user.
2. Explain why password validation happens before hashing and why a unique database index matters.
3. Check each exercise against the linked course text, then decide which exercises to claim and submit through your own account.
