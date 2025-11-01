import React from 'react';
import type { SearchResult } from '../types';
import Pagination from './Pagination';

interface SearchResultsProps {
  query: string;
  results: SearchResult[];
  totalHits: number;
  currentPage: number;
  itemsPerPage: number;
  onArticleClick: (title: string) => void;
  onPageChange: (page: number) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  results,
  totalHits,
  currentPage,
  itemsPerPage,
  onArticleClick,
  onPageChange,
}) => {

  const totalPages = Math.ceil(totalHits / itemsPerPage);

  if (results.length === 0) {
    return <div className="text-center text-gray-400 mt-8">No results found for "{query}".</div>;
  }

  return (
    <div className="animate-fade-in">
      <p className="text-gray-400 mb-6">
        Search for "{query}" yielded {totalHits.toLocaleString()} results:
      </p>
      <div className="space-y-3">
        {results.map((result) => (
          <button
            key={result.pageid}
            onClick={() => onArticleClick(result.title)}
            className="w-full text-left p-4 bg-[#181818] rounded-lg border border-gray-800 hover:bg-gray-800/50 hover:border-gray-700 transition-all duration-200 flex justify-between items-center group"
          >
            <span className="text-gray-200">{result.title}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 group-hover:text-gray-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
      {totalHits > itemsPerPage && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default SearchResults;
