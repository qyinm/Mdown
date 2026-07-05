export interface ArticleData {
  title: string;
  markdown: string;
  markdownWithMeta: string;
  meta: {
    url: string;
    date: string;
    excerpt: string;
    byline: string;
    siteName: string;
  };
}

export type ExtractionResult = ArticleData | { error: string };

export function toJsonBody(data: ArticleData): string {
  return JSON.stringify({
    title: data.title,
    url: data.meta.url,
    date: data.meta.date,
    excerpt: data.meta.excerpt,
    byline: data.meta.byline,
    siteName: data.meta.siteName,
    content: data.markdown,
  }, null, 2);
}