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
    }
  });

  // Handle messages from popup
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'download') {
      downloadMarkdown(message.title, message.markdown)
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

async function handleSave(tabId: number): Promise<void> {
  await browser.scripting.executeScript({
    target: { tabId },
    files: ['/injected.js'],
  });
  const result = await browser.tabs.sendMessage(tabId, { action: 'extract' });
  if ('error' in result) {
    console.error('Mdown:', result.error);
    return;
  }
  await downloadMarkdown(result.title, result.markdown);
}

async function downloadMarkdown(title: string, markdown: string): Promise<void> {
  const filename = sanitizeFilename(title) + '.md';
  const base64 = btoa(unescape(encodeURIComponent(markdown)));
  const dataUrl = `data:text/markdown;base64,${base64}`;

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

async function handleExportFromTab(tabId: number, target: 'chatgpt' | 'claude'): Promise<void> {
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

async function handleExport(markdown: string, target: 'chatgpt' | 'claude'): Promise<void> {
  const url = target === 'chatgpt'
    ? 'https://chatgpt.com/'
    : 'https://claude.ai/new';

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
  const selectors = target === 'chatgpt'
    ? ['#prompt-textarea', 'div[contenteditable="true"]', 'textarea']
    : ['div[contenteditable="true"].ProseMirror', 'div[contenteditable="true"]', 'textarea'];

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
