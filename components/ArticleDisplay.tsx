import React, { useEffect, useRef } from 'react';
import type { ArticleData } from '../types';
import CheckIcon from './icons/CheckIcon';

interface ArticleDisplayProps {
  article: ArticleData;
}

const ArticleDisplay: React.FC<ArticleDisplayProps> = ({ article }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Inject styles to override default MediaWiki styles for our reader mode
  useEffect(() => {
    const styleId = 'grokipedia-reader-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      .grok-reader-content {
          font-family: 'Lora', serif;
          color: #374151; /* gray-700 */
          line-height: 1.7;
          font-size: 1.125rem; /* text-lg */
      }
      .grok-reader-content .mw-parser-output > p {
        margin-bottom: 1em;
      }
      .grok-reader-content .mw-parser-output > h1,
      .grok-reader-content .mw-parser-output > h2,
      .grok-reader-content .mw-parser-output > h3,
      .grok-reader-content .mw-parser-output > h4,
      .grok-reader-content .mw-parser-output > h5 {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        font-weight: 700;
        margin-top: 2em;
        margin-bottom: 0.75em;
        line-height: 1.2;
        color: #111827; /* gray-900 */
      }
       .grok-reader-content .mw-parser-output > h1 { font-size: 2.25rem; }
       .grok-reader-content .mw-parser-output > h2 { font-size: 1.875rem; border-bottom: none; }
       .grok-reader-content .mw-parser-output > h3 { font-size: 1.5rem; }
      .grok-reader-content a {
        color: inherit;
        text-decoration: underline;
        text-decoration-color: #d1d5db; /* gray-300 */
        text-decoration-thickness: 1px;
        text-underline-offset: 2px;
        transition: text-decoration-color 0.2s;
      }
      .grok-reader-content a:hover {
        text-decoration-color: #374151; /* gray-700 */
      }
      .grok-reader-content ul {
        list-style-type: disc;
        padding-left: 1.5em;
        margin-bottom: 1em;
      }
       .grok-reader-content ul li {
        padding-left: 0.5em;
        margin-bottom: 0.5em;
      }
      /* Hide elements we don't want in reader mode */
      .grok-reader-content .infobox,
      .grok-reader-content .thumb,
      .grok-reader-content .gallery,
      .grok-reader-content .mw-editsection,
      .grok-reader-content .reflist,
      .grok-reader-content #toc,
      .grok-reader-content .navbox,
      .grok-reader-content .metadata,
      .grok-reader-content .catlinks {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
        const styleElement = document.getElementById(styleId);
        if(styleElement) {
            styleElement.remove();
        }
    }
  }, []);

  // Make links in the fetched HTML inert so they don't navigate away
  useEffect(() => {
    if (contentRef.current) {
      const links = contentRef.current.querySelectorAll('a');
      links.forEach(link => {
        link.onclick = (e) => e.preventDefault();
        link.style.cursor = 'default';
      });
    }
  }, [article.content]);

  return (
    <div className="bg-white text-gray-800 max-w-3xl mx-auto py-8 sm:py-12 animate-fade-in">
        <header className="px-4 sm:px-0">
             <div className="flex items-center space-x-2 text-gray-500 text-sm mb-4">
                <CheckIcon className="w-5 h-5" />
                <span>Fact-checked by Grok 5 days ago</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold font-serif text-gray-900 leading-tight capitalize mb-8">{article.query}</h1>
        </header>
      <article
        ref={contentRef}
        className="grok-reader-content px-4 sm:px-0"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
      <footer className="text-center mt-16 pt-6 border-t border-gray-200 text-xs text-gray-400">
        <p>https://grokipedia.com/page/{encodeURIComponent(article.query)}</p>
      </footer>
    </div>
  );
};

export default ArticleDisplay;
