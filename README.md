# Lab Result Trend Tracker

Track long-term bloodwork trends across PDFs from different doctors.

## The Problem

Lab results often live in scattered PDFs from different doctors, clinics, and years. Each appointment usually focuses on a single snapshot, which can make slow-moving trends easy to miss. A value like LDL cholesterol might still be "in range" at every individual visit while steadily climbing over multiple years.

Lab Result Trend Tracker is a hackathon prototype for turning those disconnected reports into a single trend view patients can actually follow.

## What It Does

- Upload bloodwork PDFs from different providers or points in time.
- Uses Claude to extract structured lab readings from the uploaded PDFs.
- Merges readings across uploads so the same lab marker can be compared over time.
- Visualizes lab trends so changes like "LDL has been climbing for 3 years" are easier to notice.

## Demo / Screenshots

Screenshots and demo video coming soon.

<!--
Add screenshots here:

![Upload screen](./docs/screenshots/upload.png)
![Trend chart](./docs/screenshots/trends.png)
-->

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Recharts
- Claude API, using `claude-sonnet-4-20250514` for PDF parsing

The prototype is frontend-only: there is no backend and no database. Uploaded files, parsed lab data, merging, and visualization all run in the browser.

## How It Works

1. **Upload**: The user uploads one or more bloodwork PDF files.
2. **Parse**: The frontend sends each PDF to Claude and asks for structured lab data.
3. **Merge**: Parsed readings are combined across uploads, grouping the same lab markers over time.
4. **Visualize**: Recharts renders trend views so users can scan how values have changed across years.

## Getting Started

> Note: this checkout currently does not include the application source files or `package.json`, so the exact scripts and environment variable name should be confirmed once the app code is pushed.

Expected local setup for the Vite app:

```bash
git clone https://github.com/varunanand2006/550ClaudeHackathon.git
cd 550ClaudeHackathon
npm install
npm run dev
```

The app calls Claude directly from the browser, so it needs an Anthropic API key available to the frontend. For a Vite app, this would typically be configured in a local `.env` file using a `VITE_`-prefixed variable, for example:

```bash
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

Because this is a browser-only hackathon prototype, exposing an API key in the frontend is a known limitation. A production version should move Claude calls behind a backend or serverless API route.

## Project Structure

The source tree was not present in the current repository checkout at the time this README was written. Based on the intended Vite + React structure, the app should roughly follow:

```text
src/
  components/
    # Upload UI, parsed results, and trend chart components
  lib/
    # Claude PDF parsing and lab-data merging helpers
  App.tsx
  main.tsx
```

Once the source files are pushed, this section should be updated to reflect the real component names and folders.

## Known Limitations

- No backend or database.
- Claude API calls are made directly from the frontend.
- Source files and `package.json` were not present in this checkout, so implemented components, scripts, and exact environment variable names could not be verified.
- Built quickly as a hackathon prototype, so parsing quality depends on PDF format and prompt behavior.

## Team

- [Name]
- [Name]
- [Name]

## Built At

Built in about 1 hour by a roughly 3-person team at [hackathon name placeholder], UMD.
