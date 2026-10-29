# Part 2 Phonebook — learner review draft

Exercises 2.6–2.17: controlled name, number, and filter inputs; component extraction; JSON Server persistence; Axios service; add, delete, and replace-number flows; and timed success/error notifications. Sample contacts are synthetic.

Use Node 24.1.0 (`nvm use 24.1.0`). Run `npm ci`, then `npm run server` to serve `db.json` at `http://localhost:3001/persons`. In another terminal run `npm run dev`. Run `npm test`, `npm run build`, and `npm run lint` for checks. To point the same frontend to the later Part 3 backend, set `VITE_API_URL=http://localhost:3001/api/persons` before starting Vite. The URL is a public frontend setting, not a secret.

Official sources: [forms](https://fullstackopen.com/en/part2/forms/), [server data](https://fullstackopen.com/en/part2/getting_data_from_server/), [server changes](https://fullstackopen.com/en/part2/altering_data_in_server/), [JSON Server](https://github.com/typicode/json-server), and [Axios](https://axios.rest/pages/advanced/api-reference).

AI assistance: Codex generated this draft and its tests from the course requirements. Akmaludin has not yet reviewed, verified, or submitted these exercises. Review prompt: test a duplicate name, replace a number, delete a person, and repeat an update after deleting that record from another tab. Explain where each HTTP method is used.
