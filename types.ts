// Fix: Define and export the necessary types for the application.
export interface SearchResult {
  pageid: number;
  title: string;
  snippet: string;
}

export interface ArticleData {
  query: string;
  content: string;
}

export type SavedArticle = ArticleData;

export interface MindMapData {
  foundational: string[];
  deeperDive: string[];
  relatedBranches: string[];
}

export interface ErrorReportData {
  error: string;
  componentStack: string;
  timestamp: string;
  userAgent: string;
  url: string;
  details: string; // for gemini report
}
