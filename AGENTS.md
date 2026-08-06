# Fork Maintenance Guide

This is a maintained fork of `buddingnewinsights/pi-diff`. The active Pi configuration loads this checkout directly from `~/code/pi-diff`.

## Why the fork exists

The fork carries rendering and configuration behavior required by the current Pi theme:

- reads `diffTheme`, `diffColors`, and `diffView` from Pi's actual user/project settings paths;
- supports forcing unified diff rendering and highlights Nix syntax;
- uses Shiki through an API that works in Pi's Bun runtime;
- honors explicit diff backgrounds instead of allowing Pi tool-state colors to bleed through; and
- self-renders consistently padded `write`, `edit`, and `apply_patch` frames across pending, success, error, new-file, and streamed states.

`~/dotfiles/config/pi/settings.example.json` relies on the fork's `diffTheme`, `diffView`, and `diffColors` behavior. Visual framing changes should be tested in Pi, not judged from unit tests alone.

## Retirement condition

Retire the fork when an upstream release provides equivalent settings lookup, forced unified rendering, Bun-compatible highlighting, Nix syntax, and neutral/self-rendered tool framing. Before switching back to npm, reproduce the current dotfiles palette and verify pending, successful, and failing tool calls at narrow and wide terminal widths.

If upstream makes these behaviors configurable, prefer supported configuration over carrying patches here.

## Maintenance

Keep `main` rebased on `upstream/main` and keep fork-only commits narrowly scoped. After changes, run:

```bash
npm run lint
npm run typecheck
npm test
```

Then load the checkout in Pi and visually test `write`, `edit`, and `apply_patch` rendering before updating the active installation.
