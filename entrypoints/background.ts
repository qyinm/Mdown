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
  });

  // Handle context menu clicks
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!tab?.id) return;

    if (info.menuItemId === 'mdown-copy') {
      await handleCopy(tab.id);
    } else if (info.menuItemId === 'mdown-save') {
      await handleSave(tab.id);
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
