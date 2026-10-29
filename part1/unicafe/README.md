# Unicafe — Full Stack Open Part 1

AI-assisted coursework generated with Codex. The learner reported reviewing this draft on 2026-10-29. Not yet submitted.

This is the final local state for exercises **1.6–1.11**. The requirements and labels follow the official [A more complex state, debugging React apps](https://fullstackopen.com/en/part1/a_more_complex_state_debugging_react_apps/) section.

## Run and check

Use Node.js 24.1.0. From this directory:

```sh
npm ci
npm run dev
npm test
npm run build
npm run lint
```

Feedback is kept only in React state, so refreshing the page resets it as the exercise permits.

## Exercise map

- 1.6: Three feedback buttons update good, neutral, and bad counts.
- 1.7: Statistics include all feedback, average score, and positive percentage.
- 1.8–1.9: `Statistics` receives state from `App` and shows an empty message before the first response.
- 1.10: `Button` and `StatisticLine` handle repeated UI.
- 1.11: Statistics render as an HTML table.

## Learner review prompts

1. Why is `all === 0` checked before calculating average and positive percentage?
2. For two good, one neutral, and one bad response, calculate the average and positive percentage by hand.
3. Which component owns the three counters, and what changes after clicking `bad`?
