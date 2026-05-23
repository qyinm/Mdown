import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';
import type { ExtractionResult, ArticleData } from '@/lib/types';

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

function extractArticle(): ExtractionResult {
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
    const url = document.URL;
    const now = new Date().toISOString();
    const excerpt = article.excerpt || '';
    const byline = article.byline || '';
    const siteName = article.siteName || '';

    function yamlValue(v: string): string {
      return `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    }

    const markdownWithMeta = [
      '---',
      `title: ${yamlValue(title)}`,
      `source: ${yamlValue(url)}`,
      `date: ${yamlValue(now.split('T')[0])}`,
      byline && `author: ${yamlValue(byline)}`,
      siteName && `site: ${yamlValue(siteName)}`,
      '---',
      '',
      markdown,
    ].filter(Boolean).join('\n');

    const jsonBody = JSON.stringify({
      title,
      url,
      date: now,
      excerpt,
      byline,
      siteName,
      content: markdown,
    }, null, 2);

    const data: ArticleData = { title, markdown, markdownWithMeta, jsonBody };
    return data;
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error' };
  }
}
