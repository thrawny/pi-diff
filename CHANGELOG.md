# Changelog

## [0.6.3] - 2026-06-21

### Fixed

- Fixed published/local extension load failure caused by npm auto-installing Pi host
  packages from `peerDependencies`. `pi-diff` no longer declares
  `@earendil-works/pi-coding-agent` / `@earendil-works/pi-tui` as runtime peers,
  avoiding a nested Pi runtime inside the host process.
- Made review-diff command helpers avoid top-level runtime imports from Pi host
  packages. Optional TUI pieces are loaded lazily only when needed.

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
