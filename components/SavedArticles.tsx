import React from 'react';
import type { SavedArticle } from '../types';
import TrashIcon from './icons/TrashIcon';
import MindMapIcon from './icons/MindMapIcon';

interface SavedArticlesProps {
  articles: SavedArticle[];
  onView: (article: SavedArticle) => void;
  onRemove: (query: string) => void;
  onExplore: (query: string) => void;
}

const SavedArticles: React.FC<SavedArticlesProps> = ({ articles, onView, onRemove, onExplore }) => {
  return (
    <div className="animate-fade-in space-y-4 pt-16 w-full max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-200 border-b-2 border-gray-700 pb-3">Saved Articles</h2>
      {articles.length === 0 ? (
        <div className="text-center bg-gray-800/50 rounded-lg p-8 shadow-lg mt-6">
          <p className="text-gray-400">You haven't saved any articles yet.</p>
          <p className="text-gray-500 mt-2 text-sm">Use the bookmark icon while viewing an article to save it.</p>
        </div>
      ) : (
        <ul className="space-y-3 pt-4">
          {articles.map((article) => (
            <li
              key={article.query}
              className="bg-gray-800/40 rounded-lg shadow-lg flex items-center justify-between p-4 transition-all hover:bg-gray-800/80 border border-gray-700"
            >
              <button
                onClick={() => onView(article)}
                className="text-left flex-grow mr-2"
                aria-label={`View saved article: ${article.query}`}
              >
                <h3 className="text-lg font-semibold text-gray-100 capitalize">{article.query}</h3>
              </button>
              <div className="flex items-center flex-shrink-0">
                 <button
                    onClick={() => onExplore(article.query)}
                    className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                    aria-label={`Explore topics related to ${article.query}`}
                    title="Explore related"
                  >
                    <MindMapIcon className="w-5 h-5" />
                  </button>
                <button
                  onClick={() => onRemove(article.query)}
                  className="p-2 rounded-full text-gray-400 hover:bg-red-900/50 hover:text-red-300 transition-colors"
                  aria-label={`Remove saved article: ${article.query}`}
                  title="Remove"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SavedArticles;