import type { ArticleData } from '@/lib/types';

type ExportTarget = 'chatgpt' | 'claude' | 'gemini';

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({ id: 'mdown-copy', title: 'Copy as Markdown', contexts: ['page'] });
    browser.contextMenus.create({ id: 'mdown-save', title: 'Save as Markdown', contexts: ['page'] });
    browser.contextMenus.create({ id: 'mdown-separator', type: 'separator', contexts: ['page'] });
    browser.contextMenus.create({ id: 'mdown-export-chatgpt', title: 'Export to ChatGPT', contexts: ['page'] });
    browser.contextMenus.create({ id: 'mdown-export-claude', title: 'Export to Claude', contexts: ['page'] });
    browser.contextMenus.create({ id: 'mdown-export-gemini', title: 'Export to Gemini', contexts: ['page'] });
  });

  const menuHandlers: Record<string, (tabId: number) => Promise<void>> = {
    'mdown-copy': (tabId) => injectTab(tabId, 'copy').then(() => {}),
    'mdown-save': handleSave,
    'mdown-export-chatgpt': (tabId) => handleExportFromTab(tabId, 'chatgpt'),
    'mdown-export-claude': (tabId) => handleExportFromTab(tabId, 'claude'),
    'mdown-export-gemini': (tabId) => handleExportFromTab(tabId, 'gemini'),
  };

  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!tab?.id || typeof info.menuItemId !== 'string') return;
    const handler = menuHandlers[info.menuItemId];
    if (handler) await handler(tab.id);
  });

  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'download') {
      downloadFile(message.title, message.content, message.ext || '.md')
        .then(() => sendResponse({ success: true }))
        .catch((e) => sendResponse({ error: e.message }));
      return true;
    }

    if (message.action === 'export') {
      handleExport(message.markdown, message.target)
        .then(() => sendResponse({ success: true }))
        .catch((e) => sendResponse({ error: e.message }));
      return true;
    }
  });
});

async function injectTab(tabId: number, action: string): Promise<unknown> {
  await browser.scripting.executeScript({
    target: { tabId },
    files: ['/injected.js'],
  });
  return browser.tabs.sendMessage(tabId, { action });
}

function isArticleData(result: unknown): result is ArticleData {
  return !!result && typeof result === 'object' && !('error' in result);
}

async function handleSave(tabId: number): Promise<void> {
  const result = await injectTab(tabId, 'extract');
  if (!isArticleData(result)) {
    console.error('Mdown:', (result as { error?: string })?.error ?? 'Unknown error');
    return;
  }
  await downloadFile(result.title, result.markdown);
}

async function downloadFile(title: string, content: string, ext = '.md'): Promise<void> {
  const filename = sanitizeFilename(title) + ext;
  const mimeType = ext === '.json' ? 'application/json' : 'text/markdown';
  const base64 = btoa(unescape(encodeURIComponent(content)));
  const dataUrl = `data:${mimeType};base64,${base64}`;

  await browser.downloads.download({
    url: dataUrl,
    filename,
    saveAs: true,
  });
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100);
}

async function handleExportFromTab(tabId: number, target: ExportTarget): Promise<void> {
  const result = await injectTab(tabId, 'extract');
  if (!isArticleData(result)) {
    console.error('Mdown:', (result as { error?: string })?.error ?? 'Unknown error');
    return;
  }
  await handleExport(result.markdown, target);
}

async function handleExport(markdown: string, target: ExportTarget): Promise<void> {
  const urls: Record<ExportTarget, string> = {
    chatgpt: 'https://chatgpt.com/',
    claude: 'https://claude.ai/new',
    gemini: 'https://gemini.google.com/app',
  };

  const newTab = await browser.tabs.create({ url: urls[target] });
  if (!newTab.id) throw new Error('Failed to create tab');

  await waitForTabLoad(newTab.id);
  await new Promise((r) => setTimeout(r, 1500));

  await browser.scripting.executeScript({
    target: { tabId: newTab.id },
    func: injectContent,
    args: [markdown, target],
  });
}

function waitForTabLoad(tabId: number): Promise<void> {
  return new Promise((resolve) => {
    const onUpdated = (id: number, info: { status?: string }) => {
      if (id === tabId && info.status === 'complete') {
        browser.tabs.onUpdated.removeListener(onUpdated);
        resolve();
      }
    };
    browser.tabs.onUpdated.addListener(onUpdated);
  });
}

function injectContent(markdown: string, target: string): void {
  const selectorMap: Record<string, string[]> = {
    chatgpt: ['#prompt-textarea', 'div[contenteditable="true"]', 'textarea'],
    claude: ['div[contenteditable="true"].ProseMirror', 'div[contenteditable="true"]', 'textarea'],
    gemini: ['div[contenteditable="true"].ql-editor', 'div[contenteditable="true"]', 'textarea'],
  };
  const selectors = selectorMap[target] || selectorMap.chatgpt;

  let el: HTMLElement | null = null;
  for (const sel of selectors) {
    el = document.querySelector(sel);
    if (el) break;
  }
  if (!el) return;

  el.focus();

  if (el.getAttribute('contenteditable') === 'true') {
    document.execCommand('insertText', false, markdown);
  } else if (el instanceof HTMLTextAreaElement) {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype, 'value',
    )?.set;
    nativeInputValueSetter?.call(el, markdown);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
}