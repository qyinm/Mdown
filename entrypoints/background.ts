import { saveArticle, getArticles, deleteArticle, getArticle } from '@/lib/history';

export default defineBackground(() => {
  // Create context menus on install
  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      id: 'mdown-copy',
      title: 'Copy as Markdown',
      contexts: ['page'],
    });
    browser.contextMenus.create({
      id: 'mdown-save',
      title: 'Save as Markdown',
      contexts: ['page'],
    });
    browser.contextMenus.create({
      id: 'mdown-separator',
      type: 'separator',
      contexts: ['page'],
    });
    browser.contextMenus.create({
      id: 'mdown-export-chatgpt',
      title: 'Export to ChatGPT',
      contexts: ['page'],
    });
    browser.contextMenus.create({
      id: 'mdown-export-claude',
      title: 'Export to Claude',
      contexts: ['page'],
    });
    browser.contextMenus.create({
      id: 'mdown-export-gemini',
      title: 'Export to Gemini',
      contexts: ['page'],
    });
  });

  // Handle context menu clicks
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!tab?.id) return;

    if (info.menuItemId === 'mdown-copy') {
      await handleCopy(tab.id);
    } else if (info.menuItemId === 'mdown-save') {
      await handleSave(tab.id);
    } else if (info.menuItemId === 'mdown-export-chatgpt') {
      await handleExportFromTab(tab.id, 'chatgpt');
    } else if (info.menuItemId === 'mdown-export-claude') {
      await handleExportFromTab(tab.id, 'claude');
    } else if (info.menuItemId === 'mdown-export-gemini') {
      await handleExportFromTab(tab.id, 'gemini');
    }
  });

  // Handle messages from popup
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

async function handleCopy(tabId: number): Promise<void> {
  await browser.scripting.executeScript({
    target: { tabId },
    files: ['/injected.js'],
  });
  await browser.tabs.sendMessage(tabId, { action: 'copy' });
}

async function handleSave(tabId: number, pageUrl?: string): Promise<void> {
  await browser.scripting.executeScript({
    target: { tabId },
    files: ['/injected.js'],
  });
  const result = await browser.tabs.sendMessage(tabId, { action: 'extract' });
  if ('error' in result) {
    console.error('Mdown:', result.error);
    return;
  }
  await saveArticle({ title: result.title, url: pageUrl || '', markdown: result.markdown });
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

async function handleExportFromTab(tabId: number, target: 'chatgpt' | 'claude' | 'gemini'): Promise<void> {
  await browser.scripting.executeScript({
    target: { tabId },
    files: ['/injected.js'],
  });
  const result = await browser.tabs.sendMessage(tabId, { action: 'extract' });
  if ('error' in result) {
    console.error('Mdown:', result.error);
    return;
  }
  await handleExport(result.markdown, target);
}

// --- Export to AI chat ---

async function handleExport(markdown: string, target: 'chatgpt' | 'claude' | 'gemini'): Promise<void> {
  const urls: Record<string, string> = {
    chatgpt: 'https://chatgpt.com/',
    claude: 'https://claude.ai/new',
    gemini: 'https://gemini.google.com/app',
  };
  const url = urls[target];

  const newTab = await browser.tabs.create({ url });
  if (!newTab.id) throw new Error('Failed to create tab');

  await waitForTabLoad(newTab.id);
  await sleep(1500);

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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// This function runs in the target tab's page context
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
