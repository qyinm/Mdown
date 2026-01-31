import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.action === 'extract') {
        const result = extractArticle();
        sendResponse(result);
      }
      return true;
    });
  },
});

function extractArticle(): { title: string; markdown: string } | { error: string } {
  try {
    const documentClone = document.cloneNode(true) as Document;
    const reader = new Readability(documentClone);
    const article = reader.parse();

    if (!article) {
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
