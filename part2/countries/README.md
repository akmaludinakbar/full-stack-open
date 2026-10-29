# Part 2 Countries — learner review draft

Exercises 2.18–2.20: search countries; narrow queries with more than ten matches; list two to ten matches with Show buttons; show one country's capital, area, languages, and flag; and request current capital weather. Empty, no-match, loading, and request-error states are included. Countries come from the [University of Helsinki REST Countries API](https://studies.cs.helsinki.fi/restcountries/). Weather comes from [Open-Meteo](https://open-meteo.com/en/docs), using the country record's capital coordinates and its no-key current forecast endpoint. Weather descriptions are based on the WMO codes documented there. Open-Meteo's free API is for non-commercial use under its [terms](https://open-meteo.com/en/terms).

Use Node 24.1.0 (`nvm use 24.1.0`). Run `npm ci`, `npm run dev`, `npm test`, `npm run build`, and `npm run lint` in this folder. Internet access is required for live country and weather data; automated tests mock those external requests.

Official exercise source: [Full Stack Open 2.18–2.20](https://fullstackopen.com/en/part2/adding_styles_to_react_app/).

AI assistance: Codex generated this draft and its tests from the course requirements. Akmaludin has not yet reviewed, verified, or submitted these exercises. Review prompt: search a broad term, select a country using Show, then search a unique name. Explain when the weather request runs and how errors are shown.
