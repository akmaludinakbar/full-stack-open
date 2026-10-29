# Courseinfo — Full Stack Open Part 1

AI-assisted coursework generated with Codex. The learner reported reviewing this draft on 2026-10-29. Not yet submitted.

This is the final local state for exercises **1.1–1.5**. The exercise data and progression come from the official [Introduction to React](https://fullstackopen.com/en/part1/introduction_to_react/) and [JavaScript](https://fullstackopen.com/en/part1/java_script/) sections.

## Run and check

Use Node.js 24.1.0. From this directory:

```sh
npm ci
npm run dev
npm test
npm run build
npm run lint
```

## Exercise map

- 1.1: `Header`, `Content`, and `Total` receive data from `App`.
- 1.2: `Content` delegates each part to `Part`.
- 1.3: Each part has a name and exercise count.
- 1.4: The parts are passed as an array.
- 1.5: One course object holds the name and parts.

## Learner review prompts

1. Trace how `course.parts` reaches `Part` and `Total`. What does each component receive?
2. If the second part changed from 7 to 9 exercises, which output would change and why?
3. Why does `Total` add exercise counts rather than the part names?
