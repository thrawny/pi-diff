# Changelog

All notable changes to `@heyhuynhgiabuu/pi-diff` are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.6.4] — 2025

### Fixed

- `@earendil-works/pi-coding-agent` and `@earendil-works/pi-tui` moved
  from `devDependencies` to `dependencies`. They are runtime imports, so
  the npm-published version was missing them after
  `npm install --omit=dev` (the default used by `pi install`).

  This caused the following load error in pikit (and any project using
  `pi install` to consume this package):

  ```
  pi loading extension "@heyhuynhgiabuu/pi-diff"
    Cannot find package '@earendil-works/pi-coding-agent'
  ```

### Changed

- Pinned `@earendil-works/pi-coding-agent` and `@earendil-works/pi-tui`
  to `^0.79.0` (was `*`).

### Verified

- `npm run build` succeeds
- `npm test` 143/143 pass
- `tsc --noEmit` clean
- The dist `dist/index.js` references `@earendil-works/pi-coding-agent`
  (the correct, current package name)

## [0.6.3] and earlier

See the git history: `git log --oneline -- CHANGELOG.md`.

[0.6.4]: https://github.com/buddingnewinsights/pi-diff/releases/tag/v0.6.4
[Keep a Changelog]: https://keepachangelog.com/
[Semantic Versioning]: https://semver.org/
