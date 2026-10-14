# AI Coding Prompt — Refactor Paisa Pulse Safely

Act as a senior Next.js/TypeScript engineer and pragmatic UI/UX designer. Work directly in this existing Paisa Pulse expense-tracker repository. The current project uses Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Firebase Auth, and Cloud Firestore. Preserve this stack and the existing features unless a change is necessary and explained.

## Main objective

Make this app reliable, well-structured, responsive, and visually calm. It currently has data-sync risks, oversized React modules, repeated styling, too many visual effects, and incomplete tooling. Do not simply redesign the dashboard while leaving persistence bugs behind. Refactor in small, verifiable steps and keep the app runnable throughout.

## Non-negotiable rules

1. Inspect the repository and its existing flows before editing. Keep a list of findings and map each change to the relevant file.
2. Never delete a feature, route, Firestore collection, local data, or configuration just to make the code simpler. Ask only if a truly destructive decision is unavoidable; otherwise choose the safest compatible approach.
3. Do not replace Firebase, Next.js, TypeScript, or Tailwind with another stack.
4. Do not use fake transactions/goals as if they were real user data. Clearly distinguish demo data from account data.
5. Do not silently swallow cloud write errors. Show a user-readable error and define whether the UI rolls back or marks the change as unsynced.
6. Avoid `any`. Use domain types, `unknown` plus runtime validation, or typed Firestore mapping helpers.
7. Avoid giant rewrites. Make a small group of related edits, check them, then continue.
8. Do not claim a command or test passed unless you actually ran it and saw a successful result.
9. Before changing a Firestore path or schema, document the current shape and preserve compatibility or provide a migration.
10. Keep the visual theme restrained. Anime/RPG styling may remain as a subtle optional accent, but it must not overpower financial readability.

## Phase 1 — baseline and build hygiene

- Inspect `package.json`, `tsconfig.json`, Next config, Firebase config/rules, all `src` files, and the current git diff if one exists.
- Fix all TypeScript errors first.
- Configure a non-interactive lint workflow using ESLint/Next recommendations and separate scripts for `lint`, `typecheck`, `build`, and tests. Do not leave an interactive first-run setup.
- Keep `node_modules`, `.next`, and `out` out of source control and deliverables. Keep `package-lock.json`.
- Do not change dependencies blindly; explain why each added/removed dependency is needed.

## Phase 2 — data integrity, auth, and persistence

Audit and fix these known risks:

- `loadFromStorage()` is called inside `useState` initializers. Ensure server rendering and the first client render use the same initial state, and then load guest storage after mount to avoid hydration mismatches.
- Firestore listeners in `hunterContext.tsx` ignore empty arrays. Process empty snapshots so stale/demo records do not remain on screen. Distinguish loading from a real empty result.
- Define explicit behavior for guest data vs a signed-in account. Never silently merge guest/local data into cloud data or imply that demo entries belong to the user.
- In `firestore.ts`, align client IDs and Firestore document IDs. In particular, `addGoal()` currently creates a Firestore-generated ID while the UI creates its own local ID. Ensure one stable ID is used everywhere.
- Budgets/runes currently update local state only even though budget Firestore helpers exist. Implement an end-to-end save/load/delete subscription or clearly mark budgets as local-only; prefer the same documented persistence policy as the other domains.
- Add visible error/loading/sync states for CRUD operations. If an optimistic write fails, roll it back or mark it unsynced and offer retry.
- Correct recurring bill calculations: normalize daily/weekly/monthly/annual amounts before showing a monthly commitment, and advance the next due date based on the pact's actual frequency. Handle month-end dates.
- Replace UTC-based `new Date().toISOString().slice(0, 10)` use for user-facing local dates with one tested local-date utility.
- Validate all money/date/title fields in shared functions. Reject non-finite, zero/negative amounts where not allowed, invalid dates, and blank required fields.
- Review reset-to-demo behavior when logged in. It must not pretend to reset or mutate Firestore if it only changes local state.
- Keep Firestore rules user-scoped. Never loosen security rules to hide a client-side bug.

After this phase, verify the happy path and failure path for: sign in/out, add/edit/delete transaction, add/edit/delete savings goal, deposit to goal, create/edit/delete budget, create/toggle/execute/delete recurring bill, empty new account, and offline/reconnect behavior.

## Phase 3 — simplify the UI design

Build a small consistent design system rather than styling every component independently.

Visual requirements:
- Use a clean dark theme with strong text hierarchy, restrained accent color, subtle borders, and consistent card surfaces.
- Reduce strong glows, permanent animations, `backdrop-blur`, stacked gradient backgrounds, and global scanline/grid overlays. Use effects only for meaningful focus/selected/primary states.
- Keep familiar labels such as Transactions, Income, Expenses, Savings Goals, Budgets, Categories, and Recurring Bills. Put themed wording in optional secondary copy only.
- Use consistent spacing, radius, input heights, button variants, status styles, and page headers through reusable tokens/primitives.
- Make the dashboard show a clear income/expense/net summary, one or two useful charts, recent transactions, and goals without excessive panels.
- Ensure dialogs have obvious close/cancel/save/delete actions, proper focus and keyboard behavior, and accessible labels.
- Add visible loading, empty, error, and success states.
- Respect `prefers-reduced-motion: reduce`; no essential information may depend on animation.
- Check layout at 320px, 375px, 768px, 1024px, and desktop widths. Fix actual overflow instead of hiding it globally.
- Keep all important text readable and ensure keyboard focus/contrast is adequate.

## Phase 4 — modularize without overengineering

Keep Next.js `src/app` route files thin. Extract only cohesive responsibilities from the large files, especially `hunterContext.tsx`, `StatusWindow.tsx`, `QuestLog.tsx`, `StatusLayout.tsx`, `QuestModal.tsx`, and `BountyModal.tsx`.

Suggested domains: `layout`, `ui`, `dashboard`, `transactions`, `goals`, `budgets`, `categories`, `recurring`, and `settings`. Move repeated primitives into `components/ui`; move domain CRUD/listeners into typed service modules; keep formatting, local-date, and validation functions in utilities. Keep state ownership clear and avoid prop drilling or needless global state where a local hook is sufficient.

Do not split files by arbitrary line count. Each new file should have one clear responsibility and a useful name.

## Phase 5 — testing and acceptance criteria

Create or add lightweight tests for date conversion, monthly recurring-cost conversion, amount validation, goal-deposit arithmetic, and Firestore document mapping. Where automated Firebase tests are impractical, include a precise manual test checklist.

The refactor is complete only when:
- `typecheck` passes.
- `lint` passes non-interactively.
- Production build passes in an environment with dependencies available.
- Each route renders and is responsive.
- A new account with no documents shows an empty state, not seeded fake records.
- Empty Firestore snapshots clear stale state.
- Refresh preserves guest data and cloud data as designed.
- Budget changes persist according to the stated policy.
- Recurring bills calculate and advance by the chosen frequency.
- Write errors are visible and do not silently leave false success in the UI.
- Export, SMS parsing, audio toggle, sign in/out, all forms, delete confirmations, and navigation still work.
- No real user data, keys, or local environment files are included in the source archive.

## Required workflow and final report

Work in this order: Phase 1, Phase 2, Phase 3, Phase 4, Phase 5. After each phase:
1. List the files changed and why.
2. Run the relevant checks and report their actual output.
3. Fix regressions before moving on.
4. Summarize remaining issues and any manual action needed from me.

At the end, provide the final folder tree, setup commands for Windows PowerShell, environment-variable example if necessary, test/build results, Firebase deployment steps compatible with the existing static-export configuration, and a list of any changes that still need my approval. Do not output a giant replacement code dump; edit the repository incrementally.
