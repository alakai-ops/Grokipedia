export interface SearchResult {
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
  error: string; // User-friendly primary message
  componentStack?: string; // For React rendering errors
  rawError?: string; // For caught exceptions (fetch, parse, etc.)
  targetUrl?: string; // The specific URL that failed to fetch
  rawHtmlSnippet?: string; // Raw HTML that caused a parsing/scraping error
  timestamp: string;
  userAgent: string;
  url: string; // The URL of the app itself
  details: string; // for gemini report
  scrapingStage?: string; // e.g., "Finding main content container"
  failedSelector?: string; // e.g., "ul.mw-search-results"
}


export interface VisualIssueReport {
  articleTitle: string;
  articleHtml: string;
  userDescription: string;
}
