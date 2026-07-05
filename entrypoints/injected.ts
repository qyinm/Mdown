import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';
import type { ExtractionResult } from '@/lib/types';

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

export default defineUnlistedScript(() => {
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'extract') {
      sendResponse(extractArticle());
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
    const url = document.URL;
    const now = new Date().toISOString();
    const excerpt = article.excerpt || '';
    const siteName = article.siteName || '';

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
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error' };
  }
}