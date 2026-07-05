import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';
import type { ArticleData, ExtractionResult } from '@/lib/types';

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

const PICKER_STYLE_ID = 'mdown-picker-style';

export default defineUnlistedScript(() => {
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'extract') {
      sendResponse(extractArticle());
    } else if (message.action === 'copy') {
      copyToClipboard()
        .then(() => sendResponse({ success: true }))
        .catch((e) => sendResponse({ error: e instanceof Error ? e.message : 'Unknown error' }));
      return true;
    } else if (message.action === 'startPick') {
      startElementPicker()
        .then(async (result) => {
          if (!('error' in result)) {
            await browser.runtime.sendMessage({ action: 'pickComplete', result });
          }
          sendResponse(result);
        })
        .catch((e) => sendResponse({ error: e instanceof Error ? e.message : 'Unknown error' }));
      return true;
    }
    return true;
  });
});

async function copyToClipboard(): Promise<void> {
  const result = extractArticle();
  if ('error' in result) {
    throw new Error(result.error);
  }
  await navigator.clipboard.writeText(result.markdown);
}

function buildArticleData(
  markdown: string,
  title: string,
  excerpt: string,
): ArticleData {
  const url = document.URL;
  const now = new Date().toISOString();
  const siteName = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') || '';

  function yamlValue(v: string): string {
    return `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }

  const markdownWithMeta = [
    '---',
    `title: ${yamlValue(title)}`,
    `source: ${yamlValue(url)}`,
    `date: ${yamlValue(now.split('T')[0])}`,
    excerpt && `description: ${yamlValue(excerpt)}`,
    siteName && `site: ${yamlValue(siteName)}`,
    '---',
    '',
    markdown,
  ].filter(Boolean).join('\n');

  return {
    title,
    markdown,
    markdownWithMeta,
    meta: { url, date: now, excerpt, siteName },
  };
}

function extractArticle(): ExtractionResult {
  try {
    const documentClone = document.cloneNode(true) as Document;
    const reader = new Readability(documentClone);
    const article = reader.parse();

    if (!article || !article.content) {
      return { error: 'Could not extract article content' };
    }

    const markdown = turndown.turndown(article.content);
    const title = article.title || document.title || 'Untitled';
    const excerpt = article.excerpt || '';

    return buildArticleData(markdown, title, excerpt);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

function extractFromElement(element: Element): ExtractionResult {
  try {
    const markdown = turndown.turndown(element.outerHTML);
    if (!markdown.trim()) {
      return { error: 'Selected area has no content' };
    }

    const heading = element.querySelector('h1,h2,h3,h4');
    const title = heading?.textContent?.trim()
      || document.title
      || 'Untitled';
    const excerpt = element.textContent?.trim().slice(0, 200) || '';

    return buildArticleData(markdown, title, excerpt);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

function formatSelector(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : '';
  const classes = el.classList.length
    ? `.${[...el.classList].slice(0, 4).join('.')}`
    : '';
  const label = `${tag}${id}${classes}`;
  return label.length > 72 ? `${label.slice(0, 69)}...` : label;
}

function formatFont(font: string): string {
  return font.length > 64 ? `${font.slice(0, 61)}...` : font;
}

function rgbToHex(color: string): string {
  if (color.startsWith('#')) return color;
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return color;
  const hex = [match[1], match[2], match[3]]
    .map((n) => Number(n).toString(16).padStart(2, '0'))
    .join('');
  return `#${hex}`;
}

function startElementPicker(): Promise<ExtractionResult> {
  return new Promise((resolve) => {
    injectPickerStyles();

    const root = document.createElement('div');
    root.id = 'mdown-picker-root';
    root.setAttribute('data-mdown-picker', '');

    const highlight = document.createElement('div');
    highlight.id = 'mdown-picker-highlight';

    const label = document.createElement('div');
    label.id = 'mdown-picker-label';

    const info = document.createElement('div');
    info.id = 'mdown-picker-info';

    const hint = document.createElement('div');
    hint.id = 'mdown-picker-hint';
    hint.textContent = 'Click to select · Esc to cancel';

    root.append(highlight, label, info, hint);
    document.body.appendChild(root);

    const uiNodes = [root];
    const prevCursor = document.documentElement.style.cursor;
    document.documentElement.style.cursor = 'crosshair';

    let currentEl: Element | null = null;

    function getElementAt(x: number, y: number): Element | null {
      for (const node of uiNodes) {
        node.style.visibility = 'hidden';
      }
      const el = document.elementFromPoint(x, y);
      for (const node of uiNodes) {
        node.style.visibility = 'visible';
      }
      if (!el || el.closest('[data-mdown-picker]')) return null;
      return el;
    }

    function updateInspector(el: Element) {
      const rect = el.getBoundingClientRect();
      const styles = getComputedStyle(el);
      const color = rgbToHex(styles.color);
      const selector = formatSelector(el);

      highlight.style.display = 'block';
      highlight.style.top = `${rect.top}px`;
      highlight.style.left = `${rect.left}px`;
      highlight.style.width = `${rect.width}px`;
      highlight.style.height = `${rect.height}px`;

      label.textContent = selector;
      label.style.display = 'block';
      label.style.top = `${rect.top}px`;
      label.style.left = `${rect.left}px`;

      info.style.display = 'block';
      info.innerHTML = [
        `<div class="mdown-picker-name">${selector}</div>`,
        `<div class="mdown-picker-size">${Math.round(rect.width * 100) / 100} × ${Math.round(rect.height * 100) / 100}</div>`,
        `<div class="mdown-picker-row"><span>Color</span><span class="mdown-picker-color"><i style="background:${styles.color}"></i>${color}</span></div>`,
        `<div class="mdown-picker-row"><span>Font</span><span>${formatFont(styles.font)}</span></div>`,
        `<div class="mdown-picker-row"><span>Margin</span><span>${styles.margin}</span></div>`,
        `<div class="mdown-picker-row"><span>Padding</span><span>${styles.padding}</span></div>`,
      ].join('');

      const panelHeight = info.offsetHeight || 160;
      const panelWidth = info.offsetWidth || 280;
      let top = rect.bottom + 6;
      let left = rect.left;

      if (top + panelHeight > window.innerHeight - 8) {
        top = rect.top - panelHeight - 6;
      }
      if (left + panelWidth > window.innerWidth - 8) {
        left = window.innerWidth - panelWidth - 8;
      }

      info.style.top = `${Math.max(8, top)}px`;
      info.style.left = `${Math.max(8, left)}px`;
    }

    function cleanup() {
      document.removeEventListener('mousemove', onMove, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKey, true);
      document.documentElement.style.cursor = prevCursor;
      root.remove();
    }

    function finish(result: ExtractionResult) {
      cleanup();
      resolve(result);
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        finish({ error: 'Pick cancelled' });
      }
    }

    function onMove(e: MouseEvent) {
      const el = getElementAt(e.clientX, e.clientY);
      if (!el) return;
      currentEl = el;
      updateInspector(el);
    }

    function onClick(e: MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (!currentEl) return;
      finish(extractFromElement(currentEl));
    }

    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKey, true);
  });
}

function injectPickerStyles() {
  document.getElementById(PICKER_STYLE_ID)?.remove();

  const style = document.createElement('style');
  style.id = PICKER_STYLE_ID;
  style.textContent = `
    #mdown-picker-root {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      pointer-events: none;
      overflow: visible;
    }
    #mdown-picker-highlight {
      position: fixed;
      display: none;
      pointer-events: none;
      outline: 2px solid #1a73e8;
      background: rgba(111, 168, 220, 0.5);
      box-sizing: border-box;
    }
    #mdown-picker-label {
      position: fixed;
      display: none;
      pointer-events: none;
      padding: 2px 6px;
      font: 600 11px/1.3 ui-monospace, SFMono-Regular, Menlo, monospace;
      color: #fff;
      background: #1a73e8;
      border-radius: 2px 2px 0 0;
      transform: translateY(-100%);
      max-width: min(360px, calc(100vw - 16px));
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
    }
    #mdown-picker-info {
      position: fixed;
      display: none;
      pointer-events: none;
      min-width: 220px;
      max-width: min(360px, calc(100vw - 16px));
      padding: 8px 10px;
      font: 12px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      color: #1f1f1f;
      background: rgba(255, 255, 255, 0.97);
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 6px;
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.16);
      backdrop-filter: blur(8px);
    }
    #mdown-picker-info .mdown-picker-name {
      font-weight: 600;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11px;
      color: #1a73e8;
      margin-bottom: 4px;
      word-break: break-all;
    }
    #mdown-picker-info .mdown-picker-size {
      font-size: 11px;
      color: #666;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid #eee;
    }
    #mdown-picker-info .mdown-picker-row {
      display: grid;
      grid-template-columns: 64px 1fr;
      gap: 8px;
      margin-top: 3px;
      font-size: 11px;
    }
    #mdown-picker-info .mdown-picker-row > span:first-child {
      color: #888;
    }
    #mdown-picker-info .mdown-picker-row > span:last-child {
      color: #222;
      word-break: break-word;
    }
    #mdown-picker-info .mdown-picker-color {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    #mdown-picker-info .mdown-picker-color i {
      display: inline-block;
      width: 11px;
      height: 11px;
      border: 1px solid rgba(0, 0, 0, 0.15);
      border-radius: 2px;
      flex-shrink: 0;
    }
    #mdown-picker-hint {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      padding: 8px 14px;
      font: 600 13px/1 system-ui, -apple-system, sans-serif;
      color: #fff;
      background: rgba(17, 17, 17, 0.88);
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      pointer-events: none;
      white-space: nowrap;
    }

  `;
  document.head.appendChild(style);
}

