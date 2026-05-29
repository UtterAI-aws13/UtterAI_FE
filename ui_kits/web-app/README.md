# UtterAI · Web App UI Kit

Click-thru prototype of the therapist web app. Mounts a single React app from `index.html` that simulates the core flow: **Dashboard → Sessions list → Session detail (Transcript + SOAP)**.

## Files

| File | Purpose |
|---|---|
| `index.html` | Entry point — pulls React/Babel, the design tokens, then mounts `App.jsx` |
| `App.jsx` | Router + screen-level layout |
| `Sidebar.jsx` | Left nav with role-aware items |
| `PageHeader.jsx` | Title + subtitle + action slot |
| `Button.jsx` | `primary / secondary / ghost / danger`, three sizes |
| `Icon.jsx` | Inline Lucide-style SVG icons |
| `StatusBadge.jsx` | Session/job state pills (CREATED → REPORT_READY) |
| `StatCard.jsx` | Big-number KPI cell for dashboard |
| `SessionTable.jsx` | Sortable list, hover row, action button |
| `Transcript.jsx` | Utterance rows with speaker chips + timestamps |
| `data.js` | Fake therapists, children, sessions, utterances |

## Conventions

- **One styles object per file**, named `<componentName>Styles` to avoid global collisions.
- All components export to `window.UtterUI` at the end of their file so other Babel scripts can use them.
- Tokens come from `colors_and_type.css` at the project root — never hardcode colors.
- Korean is the primary UI language; English appears only inside status enum tokens (`ANALYSIS_PROCESSING`) and metric abbreviations (MLU, TTR).
