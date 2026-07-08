# @heyhuynhgiabuu/pi-diff v0.7.4

## Highlights

- **Packaging fix** — the published package now includes the full built `dist/` tree, fixing runtime load failures like `Cannot find module './core/apply-patch.js'`.
- **Safer releases** — replaces the brittle hand-maintained package file list with `dist/` packaging so new built modules ship automatically.

## Install

```bash
pi install npm:@heyhuynhgiabuu/pi-diff@0.7.4
```

Requires Pi **0.80.x** (`@earendil-works/pi-coding-agent` ^0.80.0).
