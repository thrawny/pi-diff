# Changelog

## [0.6.2] - 2026-06-17

### Changed

- Improved edit/review diff rendering:
  - removed raw hunk headers (`@@ -x,y +a,b @@`) from pretty output,
  - removed decorative `...` separator fallback when no useful label exists,
  - kept full-width split rendering for balanced replacements,
  - switched one-sided or imbalanced hunks to unified rendering to avoid dead split columns,
  - stopped rendering empty-side filler backgrounds in split rows.

### Fixed

- Removed visible `│` center dividers and stale divider-width reservations from edit/review split rendering.
