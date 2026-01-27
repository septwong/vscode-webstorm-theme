# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Commands

```bash
# Package the extension
npm run package  # or: npx vsce package

# Publish to VSCode Marketplace
npx vsce publish
```

## Repository Structure

This is a **static VSCode theme extension** with no TypeScript/JavaScript code. Theme definitions are pure JSON.

```
├── package.json              # Plugin manifest, defines 6 themes in contributes.themes
├── themes/                   # Color theme JSON files
│   ├── ws-darker-color-theme.json
│   ├── webstorm-darcula-color-theme.json
│   ├── webstorm-dark-color-theme.json
│   ├── new_dark.json
│   ├── new_darcula.json
│   └── ws-light-color-theme.json
├── assets/images/            # Logo and preview images
└── README.md
```

## Adding New Themes

1. Add a theme entry to `package.json` under `contributes.themes`
2. Create the color theme JSON file in `themes/` directory
3. Reference: [VSCode Theme Color](https://code.visualstudio.com/api/references/theme-color)

## Theme Format

VSCode color themes use semantic tokens. Example structure:
```json
{
  "name": "Theme Name",
  "type": "dark",
  "colors": { ... },
  "tokenColors": [ ... ]
}
```

Current version: 1.0.3 (see package.json)
