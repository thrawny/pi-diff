# @heyhuynhgiabuu/pi-diff v0.7.3

## Highlights

- **New `apply_patch` tool** — atomic multi-file add/update/delete/move operations with structured JSON input.
- **Simpler edit surface** — removes `hashline_read` / `hashline_edit` and keeps `read`, `edit`, and `apply_patch` as the supported file-edit workflow.
- **Preview polish** — improves `write`, `edit`, and `apply_patch` diff rendering with compact gutters, cleaner headers, and safer cached previews.

## Install

```bash
pi install npm:@heyhuynhgiabuu/pi-diff@0.7.3
```

Requires Pi **0.80.x** (`@earendil-works/pi-coding-agent` ^0.80.0).
