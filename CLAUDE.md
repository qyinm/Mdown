# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mdown** - Browser extension that converts web pages to clean Markdown

One-click conversion of web articles to pure Markdown files, stripping ads and unnecessary UI elements. Designed as a web clipper for PKM (Personal Knowledge Management) tools like Obsidian, Notion, and Logseq. Files are saved locally (local-first approach).

## Commands

```bash
pnpm dev              # Dev server (Chrome)
pnpm dev:firefox      # Dev server (Firefox)
pnpm build            # Production build (Chrome)
pnpm build:firefox    # Production build (Firefox)
pnpm zip              # Package for distribution
pnpm compile          # Type check
```

## Architecture

WXT + Vue 3 browser extension

**Entry Points** (`entrypoints/`):
- `background.ts` - Background service worker (`defineBackground()`)
- `content.ts` - Content script injected into pages (`defineContentScript()`) - article extraction logic
- `popup/` - Extension popup UI (Vue 3)

**Components** (`components/`): Shared Vue components

**Core Flow**:
1. User clicks extension icon
2. Content script extracts main content from page (removes ads/navigation)
3. HTML → Markdown conversion
4. Download as local file

## WXT Conventions

- `defineBackground()`, `defineContentScript()` helpers are auto-imported
- `browser` API is auto-imported with cross-browser polyfill
- Use `@/` path alias for imports
