export interface ArticleData {
  title: string;
  markdown: string;
  markdownWithMeta: string;
  jsonBody: string;
}

export type ExtractionResult = ArticleData | { error: string };

export function isSuccess(result: ExtractionResult): result is ArticleData {
  return !('error' in result);
}
