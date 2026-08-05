# Contributing

## Project Structure

- Manifest V2, no build step. All code lives in `xiaoClock/`.
- `background.js` is the only runtime — uses `browser.*` APIs, a tiny Redux-like store, and `localStorage` for persistence.

## Local Testing

```bash
npm install -g web-ext
cd xiaoClock && web-ext run --keep-profile-changes
```

The extension hot-reloads on file change. Use `--verbose` to see Firefox console errors.

## Branch Workflow

- Use a separate worktree for each change to keep the main checkout clean:
  ```bash
  git worktree add ../firefox-extensions-<name> fix/<branch> -b fix/<branch>
  ```
- Squash-and-merge via GitHub PRs — keeps `master` log tidy.
- Bump version in `manifest.json` before merging.

## Context Menu Conventions

- Top-level items: `Timezone` (submenu), `Color` (submenu), `12-hour Format` (checkbox).
- Menu IDs use `tz-*` prefix for timezone items, `color-*` for color items.
- `contexts: ["browser_action"]` restricts menus to right-clicking the toolbar icon.

## Releasing

1. Bump version in `manifest.json`.
2. Zip from **inside** `xiaoClock/` so `manifest.json` lands at the root:
   ```bash
   cd xiaoClock && zip -r ../xiao-clock-X.Y.Z.zip * -x "*.DS_Store"
   ```
3. Validate at https://addons.mozilla.org/developers/addon/new before uploading.

## Coding Conventions

- Use `browser.*` (WebExtensions shim), not `chrome.*`.
- All persistent state via `localStorage`; render cycle is a 60-second timer.
- Canvas/icon reused across renders — don't re-allocate per tick.
- Guard against locale-sensitive parsing (e.g. `toLocaleString` spacing).
