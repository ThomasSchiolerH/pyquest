# PyQuest

A free, local-first Python and AI learning app built with React, TypeScript, Vite, CodeMirror 6, IndexedDB, and real Pyodide execution. No backend, account, API key, ads, or payment is required.

## Run locally

Requires Node.js 22+; Python 3.12+ and NumPy are needed for curriculum validation.

```sh
npm ci
npm run dev
# Open the printed URL with /pyquest/ appended.
```

```sh
python -m pip install numpy
npm run validate       # Type/schema/progress tests + every Python reference solution
npm run build          # TypeScript + production build + PWA assets
npm run preview        # Preview dist at /pyquest/
npm run validate:pyodide # Execute the actual worker harness using Pyodide in Node
npm run validate:timeout # Terminate a real runaway Python worker and verify recovery
npx playwright install chromium
npm run test:e2e        # Desktop and mobile browser scenarios
```

Pyodide validation downloads NumPy from its configured CDN on first use. Browser tests also need access to cdn.jsdelivr.net. Node Pyodide validation exercises the same worker harness but is not a browser rendering or iOS test.

## Free deployment: GitHub Pages

The repository is `ThomasSchiolerH/pyquest`; its expected Pages URL is **https://thomasschiolerh.github.io/pyquest/**. An expected URL is not proof of deployment.

1. In GitHub, open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
2. Push or merge to `main`. `.github/workflows/deploy.yml` validates the content, runs tests, builds, and publishes `dist` using GitHub's official Pages actions. Pull requests run validation/build without publishing.
3. Inspect **Actions → Test and deploy PyQuest**. If deployment awaits an environment review, approve it in GitHub. The workflow can also be run manually.
4. Open the URL shown by the deployment job. On iPhone Safari use **Share → Add to Home Screen**.

Vite derives the production base from `GITHUB_REPOSITORY`, defaulting to `/pyquest/`. Set `VITE_BASE_PATH=/` when deploying at a domain root. All routes use hashes, so GitHub Pages needs no rewrite server. Worker, icons, manifest, and service-worker paths use the repository base. Pyodide uses a pinned absolute CDN URL.

## How the app works

- Home, searchable paths, practice, profiles, and guided project workspaces.
- Five lesson steps: explanation, worked example, interactive activity, real coding, reflection.
- Choice, true/false, output prediction, fill-in, ordering, matching, debugging, function completion, independent coding, visual explorations, checkpoints, and cumulative projects.
- CodeMirror Python editor; genuine stdout, tracebacks, tests, hints, reference solutions after an attempt, reset, and saved drafts.
- A fresh Web Worker runs each attempt. Loading has a 120-second limit; execution has a separate 10-second limit. Timeout/cancellation terminates the worker. Outputs are capped at 20,000 characters.
- Correct activity answers and all tests on the current code are required for completion. XP is awarded once per lesson. Repeated reviews cannot farm XP.
- Local calendar-day streaks, daily goals, levels, achievements, weekly activity, bookmarks, history, and JSON backup import/export.
- Rule-based practice prioritizes mistakes, hints, and due reviews. Successful lessons return after 3 days, or 1 day after difficulty. Strong performance suggests harder exercises. This release does not dynamically rewrite exercise difficulty.
- A diagnostic checkpoint may test out the preceding lesson block; skipped lessons remain available and earn no XP. Module completion counts actual completed entries.
- Light/dark/system themes, keyboard controls, reduced-motion support, responsive layouts, and installation assets.

## Content and architecture

`src/content/*.json` contains all educational content separately from UI logic. `src/schema.ts` defines the lesson, exercise, test, module, project, checkpoint, progress, and achievement contracts. `src/lib` owns persistence, scoring, and worker lifecycle. `public/python-worker.js` owns Python execution. `scripts/validate_python.py` executes each solution and proves the starter cannot already pass all tests. `tests/core.test.ts` validates content structure, references, answers, progress, XP, streaks, checkpoint scoring, prerequisites, imports, persistence, and timeout/cancellation behavior.

See `CONTENT_STATUS.md` for exact authored counts and verification status. A project means a complete set of three milestones, not three separate projects.

## Honest limitations

- This is a local-first app. Clearing browser storage can erase learning progress. Export backups regularly; importing replaces the current state. There is no cross-device cloud sync.
- The service worker caches app assets and lesson content after a successful online visit. Python/NumPy may require network downloads. **Full offline Python support is not claimed.** No iPhone installation or offline browser test has been completed in the build environment.
- Pyodide runs real CPython but is **not a secure sandbox** for arbitrary third-party code. Each run has a fresh virtual filesystem; files do not persist between runs. Memory exhaustion is not separately constrained.
- PyTorch, FastAPI servers, hosted model calls, and production deployments do not run inside browser exercises. Browser tasks use stdlib/NumPy equivalents or explicitly labeled deterministic simulations. Downloadable scripts demonstrate supported local workflows and require their own dependencies. They have not been executed as production services here.
- Browser model behavior is simulated and labeled. The final LLM milestone offers an optional, unexecuted local adapter for an OpenAI-compatible API, with endpoint/model/key read from environment variables. No model credentials are stored in the browser.
- The browser preview infrastructure failed to open its relay port in this session. Automated browser scenarios are included, but browser layout, service-worker offline behavior, iOS installation, and end-to-end browser tests remain unverified.
