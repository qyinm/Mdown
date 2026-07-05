export interface ArticleData {
  title: string;
  markdown: string;
  markdownWithMeta: string;
  meta: {
    url: string;
    date: string;
    excerpt: string;
    siteName: string;
  };
}

export type ExtractionResult = ArticleData | { error: string };

export interface ClipFields {
  title: string;
  source: string;
  date: string;
  description: string;
  site: string;
}

function yamlValue(v: string): string {
  return `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

export function buildMarkdownOutput(fields: ClipFields, body: string): string {
  const lines = [
    '---',
    `title: ${yamlValue(fields.title)}`,
    `source: ${yamlValue(fields.source)}`,
    `date: ${yamlValue(fields.date)}`,
  ];
  if (fields.description) lines.push(`description: ${yamlValue(fields.description)}`);
  if (fields.site) lines.push(`site: ${yamlValue(fields.site)}`);
  lines.push('---', '', body);
  return lines.join('\n');
}

export function toJsonOutput(fields: ClipFields, content: string): string {
  return JSON.stringify({
    title: fields.title,
    url: fields.source,
    date: fields.date,
    excerpt: fields.description,
    siteName: fields.site,
    content,
  }, null, 2);
}

export function fieldsFromArticle(data: ArticleData): ClipFields {
  return {
    title: data.title,
    source: data.meta.url,
    date: data.meta.date.split('T')[0],
    description: data.meta.excerpt,
    site: data.meta.siteName,
  };
}