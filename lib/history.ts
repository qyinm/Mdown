export interface Article {
  id: string;
  title: string;
  url: string;
  markdown: string;
  createdAt: string;
}

const STORAGE_KEY = 'mdown-articles';

function getArticlesFromStorage(): Article[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveToStorage(articles: Article[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
}

export function saveArticle(article: Omit<Article, 'id' | 'createdAt'>): Promise<void> {
  const articles = getArticlesFromStorage();
  const newArticle: Article = {
    ...article,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  articles.unshift(newArticle);
  // Keep max 100 articles
  if (articles.length > 100) articles.length = 100;
  saveToStorage(articles);
  return Promise.resolve();
}

export function getArticles(): Promise<Article[]> {
  return Promise.resolve(getArticlesFromStorage());
}

export function getArticle(id: string): Promise<Article | undefined> {
  const articles = getArticlesFromStorage();
  return Promise.resolve(articles.find((a) => a.id === id));
}

export function deleteArticle(id: string): Promise<void> {
  const articles = getArticlesFromStorage();
  saveToStorage(articles.filter((a) => a.id !== id));
  return Promise.resolve();
}