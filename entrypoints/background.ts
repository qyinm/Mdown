export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'download') {
      downloadMarkdown(message.title, message.markdown)
        .then(() => sendResponse({ success: true }))
        .catch((e) => sendResponse({ error: e.message }));
      return true;
    }
  });
});

async function downloadMarkdown(title: string, markdown: string): Promise<void> {
  const filename = sanitizeFilename(title) + '.md';
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);

  await browser.downloads.download({
    url,
    filename,
    saveAs: true,
  });

  URL.revokeObjectURL(url);
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100);
}
