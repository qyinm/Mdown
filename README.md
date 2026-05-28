<p align="center">
  <img src="README Cover.png" alt="Mdown" width="600">
</p>

<p align="center">
  <strong>Web to Markdown, One Click</strong>
</p>

<p align="center">
  <a href="https://chromewebstore.google.com/detail/bmebbnpnakgpmmhlkhlaoihcdkfeogch?utm_source=item-share-cb">
    <img src="https://img.shields.io/chrome-web-store/users/bmebbnpnakgpmmhlkhlaoihcdkfeogch?style=flat-square&logo=googlechrome&logoColor=white&label=users&color=4285F4" alt="Chrome Web Store users">
  </a>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#development">Development</a> •
  <a href="PRIVACY.md">Privacy</a>
</p>

---

## Features

- **Clean Extraction** — Removes ads, navigation, and clutter using Mozilla Readability
- **Markdown Conversion** — Converts HTML to properly formatted Markdown with Turndown
- **Copy or Save** — Copy to clipboard or download as `.md` file
- **Local-first** — All processing happens on your device, no data sent anywhere

Perfect for [Obsidian](https://obsidian.md), [Logseq](https://logseq.com), [Notion](https://notion.so), and other PKM tools.

## Installation

### Chrome Web Store
- Install now: [Mdown on Chrome Web Store](https://chromewebstore.google.com/detail/bmebbnpnakgpmmhlkhlaoihcdkfeogch?utm_source=item-share-cb)

### Manual Installation
1. Download the latest release
2. Go to `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder

## Development

```bash
pnpm install
pnpm dev          # Chrome
pnpm dev:firefox  # Firefox
```

## Build

```bash
pnpm build
pnpm zip          # Package for distribution
```

## License

MIT
