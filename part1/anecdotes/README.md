# Anecdotes — Full Stack Open Part 1

AI-assisted coursework generated with Codex. The learner reported reviewing this draft on 2026-10-29. Not yet submitted.

This is the final local state for exercises **1.12–1.14**. The eight anecdotes are sample text from the official [A more complex state, debugging React apps](https://fullstackopen.com/en/part1/a_more_complex_state_debugging_react_apps/) section.

## Run and check

Use Node.js 24.1.0. From this directory:

```sh
npm ci
npm run dev
npm test
npm run build
npm run lint
```

Votes are kept only for the current page session.

## Exercise map

- 1.12: The next button selects a random anecdote.
- 1.13: Voting updates the selected anecdote's count through a new votes array.
- 1.14: The anecdote with the most votes appears separately. At zero votes, or on any later tie, the earliest tied anecdote appears.

## Learner review prompts

1. How does `Math.floor(Math.random() * anecdotes.length)` choose a valid index?
2. Why does the vote handler create a new array instead of changing `votes[selected]` directly?
3. If anecdotes at indexes 0 and 1 each have two votes, which one appears as the leader, and why?
