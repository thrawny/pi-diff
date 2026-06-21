# Release notes

This file is the human-readable release log for `@heyhuynhgiabuu/pi-diff`.
The machine-readable equivalent lives in `CHANGELOG.md`; this file is
what the GitHub release page and `pi install` changelog picker will show.

## 0.6.4 — 2025

### Fixed

- **`Cannot find package '@earendil-works/pi-coding-agent'`** on
  `pi install`. `@earendil-works/pi-coding-agent` and
  `@earendil-works/pi-tui` are runtime imports and were incorrectly
  listed under `devDependencies`. They are now in `dependencies` and
  pinned to `^0.79.0` so the npm tarball includes them after
  `npm install --omit=dev` (the default used by `pi install`).

### What you need to do

Nothing. The next `pi install` (or upgrade) picks up 0.6.4
automatically. If you pinned a specific version, run:

```bash
pi install @heyhuynhgiabuu/pi-diff@0.6.4
```

To verify it's working, start pi and look for the
`@heyhuynhgiabuu/pi-diff` line in the extension list. There should be
no `Cannot find package` error.

### Compatibility

- pi SDK: `>= 0.79.0` (uses the new `@earendil-works/pi-coding-agent`
  scope; no longer works with the old `@mariozechner/pi-coding-agent`
  scope that shipped with pi < 0.51)
- Node: `>= 20`
- TUI: `>= 0.79.0` (uses `@earendil-works/pi-tui`)

### Verified

- `npm run build` succeeds
- `npm test` 143/143 pass
- `tsc --noEmit` clean
- `dist/index.js` references `@earendil-works/pi-coding-agent`
- Fresh `npm install` produces a `node_modules/@earendil-works/`
  with both SDK packages present

---

## 0.6.3

See `CHANGELOG.md` for the 0.6.x series history.
