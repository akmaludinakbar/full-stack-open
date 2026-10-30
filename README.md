# Full Stack Open coursework

Coursework for [Full Stack Open](https://fullstackopen.com/), University of Helsinki.

## AI assistance and status

Codex assisted with planning, implementation, explanations, tests, and review. This repository does not present generated code as unaided work. On 30 October 2026, the learner reported reading the materials and reviewing the prepared work listed below, covering Parts 0–4 and 5.1–5.12. Part 3 is deployed on Vercel Hobby and connected to MongoDB Atlas; the exercise 3.12 CLI add/list flow against Atlas and cleanup of its synthetic test contact were verified. The official course submission service recorded 97 submitted exercises and issued the English Full Stack Open Certificate of Completion with grade 3 on 30 October 2026. This is course completion; no university-credit registration or credit-exam completion is claimed.

## Exercises

| Part | Files | Scope |
| --- | --- | --- |
| 0 | `part0` | Sequence diagrams 0.4–0.6; readings 0.1–0.3 are not code uploads |
| 1 | `part1/courseinfo` | 1.1–1.5 |
| 1 | `part1/unicafe` | 1.6–1.11 |
| 1 | `part1/anecdotes` | 1.12–1.14 |
| 2 | `part2/courseinfo` | 2.1–2.5 |
| 2 | `part2/phonebook` | 2.6–2.17 |
| 2 | `part2/countries` | 2.18–2.20 |
| 3 | `part3/phonebook-backend` | 3.1–3.22; live Vercel/Atlas checks and Atlas CLI add/list verified |
| 4 | `part4/bloglist-backend` | 4.1–4.23 |
| 5 | `part5/bloglist-frontend` | 5.1–5.12 |

Each application has its own README, package lock, and behavior tests. Use Node.js 24.1.0, enter the app directory, then run `npm ci`, `npm test`, `npm run build`, or `npm run dev`.

Exercise wording and sample data are attributed to the official course in each app or diagram. Final application states represent the incremental exercise series. Private learning notes, local process reports, credentials, dependency directories, and build outputs are excluded.

Phonebook deployment source is also available in [full-stack-open-phonebook](https://github.com/akmaludinakbar/full-stack-open-phonebook). The [live Phonebook application](https://full-stack-open-phonebook-ruddy.vercel.app) is deployed on Vercel Hobby without entering a card. Production build, frontend/API access, browser create/reload persistence, API update/delete, and synthetic-data cleanup were verified on 30 October 2026. The exercise 3.12 CLI also added and listed a unique synthetic contact against Atlas; that contact was then removed. The URI was supplied only through an ephemeral environment variable, with no credential file saved. This technical evidence supports 3.10, 3.11, 3.12 and 3.21. Separately, the official service accepted the listed 97 exercises and issued the course completion certificate. Exercises 5.13 onward are outside this submitted scope.
