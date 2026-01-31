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
