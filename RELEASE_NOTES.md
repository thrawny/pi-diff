# @heyhuynhgiabuu/pi-diff v0.7.6

## Highlights

- **Configurable tools** — use `disabledTools` in `pi-diff.json` to omit `write`, `edit`, or `apply_patch`; the first two fall back to Pi's built-ins.
- **Safer patches** — `apply_patch` preflights changes, avoids unsafe source matches and clobbers, preserves modes and CRLF, and rolls back after commit failures.
- **Clear failure state** — failed `apply_patch` output now uses the active theme's error foreground and background.

## Install

```bash
pi install npm:@heyhuynhgiabuu/pi-diff@0.7.6
```

Requires Pi **0.80.x** (`@earendil-works/pi-coding-agent` ^0.80.0).
