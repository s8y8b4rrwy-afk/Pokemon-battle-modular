# Bug Findings

Date: 2026-02-26

## 1) High - Continue screen can crash on corrupted save data

- File: `js/screens/title_flow.js:33-50`
- File: `js/systems/storage.js:15-27`
- Problem: `ContinueScreen.onEnter()` assumes `StorageSystem.load()` always returns an object and immediately dereferences `data.wins`, `data.party`, etc.
- Why it breaks: `StorageSystem.exists()` only checks whether raw localStorage exists, while `StorageSystem.load()` returns `null` when JSON parsing fails.
- Impact: malformed/corrupted save can cause startup crash on the Continue flow.

## 2) Medium - Summary action button can stay hidden after READ_ONLY mode

- File: `js/screens/summary.js:111-120`
- Problem: In `READ_ONLY`, `btn.style.display = 'none'` is set, but non-READ_ONLY modes never reset it to visible.
- Why it breaks: later openings of Summary in normal modes reuse the same DOM button and only change text/class/disabled.
- Impact: Action button (`SHIFT`, `USE`, etc.) can disappear in Party/Selection summaries after viewing Continue preview summaries.

## 3) Medium - Continue preview summary can crash on legacy saves

- File: `js/screens/title_flow.js:50-57`
- File: `js/screens/summary.js:176`
- Problem: Continue preview passes raw `data.party` directly into Summary, bypassing migration logic in `Game.load()`.
- Why it breaks: Summary expects newer fields (example: `growthRate`) and calls `p.growthRate.replace(...)`.
- Impact: clicking a party icon in Continue preview can throw on older save schemas.

## Validation Scope

- Ran syntax checks (`node --check`) across all JS files: no parse errors.
- Findings above are confirmed by static code review and control-flow inspection.
