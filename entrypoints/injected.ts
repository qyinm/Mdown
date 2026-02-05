import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';

export default defineUnlistedScript(() => {
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'extract') {
      const result = extractArticle();
      sendResponse(result);
    } else if (message.action === 'copy') {
      copyToClipboard()
        .then(() => sendResponse({ success: true }))
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

function extractArticle(): { title: string; markdown: string } | { error: string } {
  try {
    const documentClone = document.cloneNode(true) as Document;
    const reader = new Readability(documentClone);
    const article = reader.parse();

    if (!article || !article.content) {
      return { error: 'Could not extract article content' };
    }

    const turndown = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
    });

    const markdown = turndown.turndown(article.content);
    const title = article.title || document.title || 'Untitled';

    return { title, markdown };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error' };
  }
}
