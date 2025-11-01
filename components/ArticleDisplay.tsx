import React, { useEffect, useRef, useState } from 'react';
import type { ArticleData } from '../types';
import CheckIcon from './icons/CheckIcon';
import VisualIssueReporter from './VisualIssueReporter';

interface ArticleDisplayProps {
  article: ArticleData;
  onLinkClick: (title: string) => void;
}

const ArticleDisplay: React.FC<ArticleDisplayProps> = ({ article, onLinkClick }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [mainContent, setMainContent] = useState('');
  const [sideContent, setSideContent] = useState<string[]>([]);


  // Inject styles to override default MediaWiki styles for our reader mode
  useEffect(() => {
    const styleId = 'grokipedia-reader-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      .grok-reader-article {
          font-family: 'Lora', serif;
          color: #374151; /* gray-700 */
          line-height: 1.7;
          font-size: 1.125rem; /* text-lg */
      }
      .grok-reader-article .mw-parser-output::after {
          content: "";
          display: table;
          clear: both;
      }
      .grok-reader-article p {
        margin-bottom: 1em;
      }
      .grok-reader-article h1,
      .grok-reader-article h2,
      .grok-reader-article h3,
      .grok-reader-article h4,
      .grok-reader-article h5 {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        font-weight: 700;
        margin-top: 2em;
        margin-bottom: 0.75em;
        line-height: 1.2;
        color: #111827; /* gray-900 */
      }
       .grok-reader-article h1 { font-size: 2.25rem; }
       .grok-reader-article h2 { font-size: 1.875rem; border-bottom: none; }
       .grok-reader-article h3 { font-size: 1.5rem; }
      .grok-reader-article a {
        color: #2563eb; /* blue-600 */
        text-decoration: none;
        border-bottom: 1px solid #9ca3af; /* gray-400 */
        transition: all 0.2s ease-in-out;
      }
      .grok-reader-article a:hover {
        color: #1d4ed8; /* blue-700 */
        border-bottom-color: #1d4ed8;
        background-color: rgba(59, 130, 246, 0.1); /* A very light blue */
      }
      .grok-reader-article a.image, .grok-reader-article a.internal {
         border-bottom: none;
         background-color: transparent;
      }
      .grok-reader-article a.new {
        color: #dc2626; /* red-600 */
        border-bottom-color: #fca5a5; /* red-300 */
      }
      .grok-reader-article a.new:hover {
        color: #b91c1c; /* red-700 */
        border-bottom-color: #b91c1c;
        background-color: rgba(239, 68, 68, 0.1);
      }
      .grok-reader-article ul {
        list-style-type: disc;
        padding-left: 1.5em;
        margin-bottom: 1em;
      }
       .grok-reader-article ul li {
        padding-left: 0.5em;
        margin-bottom: 0.5em;
      }

      /* General styles for infoboxes/thumbnails, whether in main or side content */
      .infobox, .infobox_v2 {
          display: table;
          border: 1px solid #e2e8f0; /* gray-200 */
          background-color: #f8fafc; /* slate-50 */
          padding: 0;
          font-size: 0.9em;
          line-height: 1.5;
          color: #4a5568; /* gray-600 */
          border-spacing: 0; /* for tables */
      }
      .infobox th, .infobox td {
          padding: 0.5rem 0.75rem;
          text-align: left;
          border-bottom: 1px solid #e2e8f0; /* gray-200 */
          vertical-align: top;
      }
      .infobox tr:last-child th,
      .infobox tr:last-child td {
          border-bottom: none;
      }
      .infobox th {
          font-weight: 600;
          color: #2d3748; /* gray-800 */
      }
      .infobox .infobox-above,
      .infobox .infobox-header,
      .infobox .mergedtoprow th {
          font-size: 1.1em;
          font-weight: bold;
          text-align: center;
          background-color: #f1f5f9; /* slate-100 */
      }
      .infobox-image { text-align: center; }
      .infobox-image img { max-width: 100%; height: auto; }
      .infobox .infobox-caption {
          font-size: 0.85em;
          text-align: center;
          padding: 0.25rem 0.5rem 0.5rem;
          border-top: 1px solid #e2e8f0;
      }

      .thumb {
          padding: 0.5rem;
          background-color: #f8fafc; /* slate-50 */
          border: 1px solid #e2e8f0; /* gray-200 */
      }
      .thumbinner { max-width: 280px; }
      .thumb img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 0 auto;
      }
      .thumbcaption {
          font-size: 0.9em;
          padding-top: 0.5rem;
          text-align: left;
          line-height: 1.4;
          color: #4a5568; /* gray-600 */
      }

      /* Hide elements we don't want in reader mode */
      .grok-reader-article .mw-editsection,
      .grok-reader-article .reflist,
      .grok-reader-article #toc,
      .grok-reader-article .navbox,
      .grok-reader-article .metadata,
      .grok-reader-article .catlinks {
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

  // Parse content to separate main text from side elements
  useEffect(() => {
    if (!article.content) return;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = article.content;

    const parserOutput = tempDiv.querySelector('.mw-parser-output');
    const contentRoot = parserOutput || tempDiv;

    const sideElementSelectors = '.infobox, .thumb, .tright, .floatright, .infobox_v2, .vertical-navbox';
    const sideElements = Array.from(contentRoot.querySelectorAll(sideElementSelectors));
    
    const sideHtml: string[] = [];
    sideElements.forEach(el => {
      // Only extract top-level side elements to avoid grabbing nested ones.
      if (el.parentElement === contentRoot) {
        sideHtml.push(el.outerHTML);
        el.remove();
      }
    });

    setMainContent(contentRoot.innerHTML);
    setSideContent(sideHtml);
  }, [article.content]);

  // Intercept internal article links to navigate within the app
  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement || !onLinkClick) return;

    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');

      if (!link) return;

      const href = link.getAttribute('href');

      // Only handle internal links to other articles
      // Regex to match `/wiki/` links but not `/wiki/File:`, `/wiki/Category:`, etc.
      const isArticleLink = href && /^\/wiki\/[^:]+$/.test(href);
      
      if (isArticleLink) {
        event.preventDefault();
        const title = decodeURIComponent(href.replace('/wiki/', '')).replace(/_/g, ' ');
        onLinkClick(title);
      } else {
        // Prevent navigation for all other links (external, files, categories)
        event.preventDefault();
      }
    };

    contentElement.addEventListener('click', handleLinkClick);

    return () => {
      contentElement.removeEventListener('click', handleLinkClick);
    };
  }, [mainContent, onLinkClick]);

  return (
    <div id="article-content-wrapper" className="bg-white text-gray-800 max-w-3xl mx-auto py-8 sm:py-12 animate-fade-in grok-reader-article">
      <header className="px-4 sm:px-0">
          <div className="flex items-center space-x-2 text-gray-500 text-sm mb-4">
            <CheckIcon className="w-5 h-5" />
            <span>Fact-checked by Grok 5 days ago</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold font-serif text-gray-900 leading-tight capitalize mb-8">{article.query}</h1>
      </header>
      
      <div className="flex flex-col lg:flex-row lg:gap-x-8 px-4 sm:px-0">
        <main className="lg:w-2/3 min-w-0">
          <article
            ref={contentRef}
            dangerouslySetInnerHTML={{ __html: mainContent }}
          />
        </main>
        {sideContent.length > 0 && (
          <aside className="lg:w-1/3 mt-8 lg:mt-0 flex-shrink-0">
            <div className="space-y-6">
              {sideContent.map((html, index) => (
                <div key={index} dangerouslySetInnerHTML={{ __html: html }} />
              ))}
            </div>
          </aside>
        )}
      </div>
      
      <footer className="px-4 sm:px-0 text-center mt-16 pt-6 border-t border-gray-200 text-xs text-gray-400">
        <p>https://grokipedia.com/page/{encodeURIComponent(article.query)}</p>
      </footer>

      <VisualIssueReporter article={article} />
    </div>
  );
};

export default ArticleDisplay;