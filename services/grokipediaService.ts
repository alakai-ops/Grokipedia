import type { SearchResult } from '../types';

export const BASE_URL = 'https://grokipedia.com';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

/**
 * Custom error class to hold detailed context during a scraping failure.
 */
export class ScrapingError extends Error {
    htmlText: string;
    stage: string; // The logical step where the error occurred
    selector?: string; // The CSS selector that failed, if applicable

    constructor(message: string, htmlText: string, stage: string, selector?: string) {
        super(message);
        this.name = 'ScrapingError';
        this.htmlText = htmlText;
        this.stage = stage;
        this.selector = selector;
    }
}

const fetchHtml = async (url: string): Promise<{ doc: Document, htmlText: string }> => {
    const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
    try {
        const response = await fetch(proxiedUrl);
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Request failed with status ${response.status} ${response.statusText}. Body: ${errorBody}`);
        }
        const htmlText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        return { doc, htmlText };
    } catch(error: any) {
        console.error(`Error fetching from proxied URL ${proxiedUrl}:`, error);
        throw new Error(`Failed to fetch from URL: ${url}. Reason: ${error.message}`);
    }
};

/**
 * Searches for articles by scraping the search results page.
 */
export const search = async (query: string, page: number, limit: number): Promise<{ results: SearchResult[], totalHits: number }> => {
    const offset = (page - 1) * limit;
    const searchUrl = `${BASE_URL}/w/index.php?search=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`;
    const { doc, htmlText } = await fetchHtml(searchUrl);

    // Case 1: Search redirects directly to an article page
    if (doc.querySelector('#mw-content-text .mw-parser-output')) {
         const titleElement = doc.querySelector('h1#firstHeading');
         const title = titleElement?.textContent?.trim() || query;
         return {
             results: [{ title, snippet: 'This search resulted in a direct match for the article.' }],
             totalHits: 1,
         };
    }

    // Case 2: Standard search results page
    const selector = 'ul.mw-search-results';
    const searchResultsContainer = doc.querySelector(selector);
    
    if (!searchResultsContainer) {
        // Case 3: No results found page
        if (doc.querySelector('.mw-search-nonefound')) {
            return { results: [], totalHits: 0 };
        }
        // Case 4: Unknown page structure, throw detailed error
        throw new ScrapingError('Could not find search results container.', htmlText, 'Finding search results container', selector);
    }
    
    const results: SearchResult[] = [];
    const resultElements = searchResultsContainer.querySelectorAll('li.mw-search-result');
    resultElements.forEach(li => {
        const titleAnchor = li.querySelector('.mw-search-result-heading a');
        const snippetDiv = li.querySelector('.searchresult');

        if (titleAnchor) {
            const title = titleAnchor.textContent || '';
            let snippet = snippetDiv?.textContent || '';
            const infoDiv = snippetDiv?.querySelector('.search-result-meta');
            if (infoDiv) {
                // Clean up snippet by removing the metadata text
                snippet = snippet.replace(infoDiv.textContent || '', '');
            }
            
            results.push({
                title: title.trim(),
                snippet: snippet.trim(),
            });
        }
    });

    // Gracefully infer total hits if the element isn't found
    let totalHits = results.length;
    const resultsInfo = doc.querySelector('.results-info');
    if (resultsInfo) {
        const text = resultsInfo.textContent || '';
        const match = text.match(/of ([\d,]+)/);
        if (match && match[1]) {
            totalHits = parseInt(match[1].replace(/,/g, ''), 10);
        }
    } else if (results.length > 0) {
        // Fallback: estimate total hits if the info element is missing
        totalHits = offset + results.length + (results.length === limit ? 1 : 0);
    }
    
    return { results, totalHits };
};

/**
 * Fetches and parses a single article page.
 */
export const fetchArticle = async (title: string): Promise<string> => {
    const articleUrl = `${BASE_URL}/page/${encodeURIComponent(title.replace(/ /g, '_'))}`;
    const { doc, htmlText } = await fetchHtml(articleUrl);
    
    const selector = '#mw-content-text .mw-parser-output';
    const contentDiv = doc.querySelector(selector);
    
    if (!contentDiv) {
        throw new ScrapingError('Could not find the main article content.', htmlText, 'Finding article content container', selector);
    }

    // Rewrite relative URLs to be absolute to work in the app context
    contentDiv.querySelectorAll('a').forEach(a => {
        const href = a.getAttribute('href');
        if (href && href.startsWith('/')) {
            a.setAttribute('href', `${BASE_URL}${href}`);
        }
    });
     contentDiv.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src');
        if (src && src.startsWith('/')) {
            img.setAttribute('src', `${BASE_URL}${src}`);
        }
    });

    return contentDiv.innerHTML;
};