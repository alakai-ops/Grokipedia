import type { SearchResult } from '../types';

export const BASE_URL = 'https://grokipedia.com';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';


const fetchHtml = async (url: string): Promise<Document> => {
    const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
    try {
        const response = await fetch(proxiedUrl);
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Request failed with status ${response.status} ${response.statusText}. Body: ${errorBody}`);
        }
        const htmlText = await response.text();
        const parser = new DOMParser();
        return parser.parseFromString(htmlText, 'text/html');
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

    const doc = await fetchHtml(searchUrl);

    const results: SearchResult[] = [];
    const searchResultsContainer = doc.querySelector('.mw-search-results-container');
    
    if (!searchResultsContainer) {
        // This might happen if there's a direct match and redirect, or no results.
        // Check for no results message.
        const noResults = doc.querySelector('.mw-search-nonefound');
        if (noResults) {
            return { results: [], totalHits: 0 };
        }
        // If it's a direct page, we can treat it as a single result.
        if (doc.querySelector('#mw-content-text')) {
             const titleElement = doc.querySelector('h1#firstHeading');
             const title = titleElement ? titleElement.textContent || query : query;
             return {
                 results: [{ title, snippet: 'Direct match for this article.' }],
                 totalHits: 1,
             };
        }

        throw new Error('Could not find search results container on the page.');
    }

    const resultElements = searchResultsContainer.querySelectorAll('li.mw-search-result');
    resultElements.forEach(li => {
        const titleAnchor = li.querySelector('.mw-search-result-heading a');
        const snippetDiv = li.querySelector('.searchresult');

        if (titleAnchor && snippetDiv) {
            const title = titleAnchor.textContent || '';
            // Remove the size and date info from the snippet
            const infoDiv = snippetDiv.querySelector('.search-result-meta');
            if (infoDiv) infoDiv.remove();

            const snippet = snippetDiv.textContent || '';
            
            results.push({
                title: title.trim(),
                snippet: snippet.trim(),
            });
        }
    });

    // Try to parse total hits for pagination
    let totalHits = results.length;
    const resultsInfo = doc.querySelector('.results-info');
    if (resultsInfo) {
        const text = resultsInfo.textContent || '';
        const match = text.match(/of ([\d,]+)/);
        if (match && match[1]) {
            totalHits = parseInt(match[1].replace(/,/g, ''), 10);
        }
    } else if (results.length > 0) {
        // Fallback if the info element isn't there
        totalHits = offset + results.length + (results.length === limit ? 1 : 0);
    }
    
    return { results, totalHits };
};

/**
 * Fetches and parses a single article page.
 */
export const fetchArticle = async (title: string): Promise<string> => {
    const articleUrl = `${BASE_URL}/page/${encodeURIComponent(title.replace(/ /g, '_'))}`;
    
    const doc = await fetchHtml(articleUrl);
    
    const contentDiv = doc.querySelector('#mw-content-text .mw-parser-output');
    
    if (!contentDiv) {
        throw new Error('Could not find the main article content.');
    }

    // Rewrite relative URLs to be absolute
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