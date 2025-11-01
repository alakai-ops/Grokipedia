// Fix: Implement the Welcome screen component.
import React from 'react';
import SearchBar from './SearchBar';
import GrokipediaIcon from './icons/GrokipediaIcon';
import TrashIcon from './icons/TrashIcon';

interface WelcomeProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  searchHistory: string[];
  onClearHistory: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onSearch, isLoading, searchHistory, onClearHistory }) => {
  const exampleSearches = [
    'General relativity',
    'Machine learning',
    'History of the internet',
    'Quantum computing',
  ];

  const handleExampleClick = (query: string) => {
    onSearch(query);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in pt-16">
      <GrokipediaIcon className="w-24 h-24 mb-4 text-gray-300" />
      <h1 className="text-4xl sm:text-5xl font-bold text-gray-100">Grokipedia</h1>
      <p className="mt-4 text-lg text-gray-400 max-w-md">
        A dedicated mobile experience for the content on grokipedia.com.
      </p>

      <div className="w-full max-w-xl mt-10">
        <SearchBar onSearch={onSearch} isLoading={isLoading} searchHistory={searchHistory} />
      </div>

      {searchHistory.length > 0 && (
         <div className="w-full max-w-xl mt-8 text-gray-500">
            <div className="flex justify-between items-center mb-3 px-2">
                <p className="text-sm font-medium text-gray-400">Recent Searches</p>
                <button 
                    onClick={onClearHistory} 
                    className="p-1.5 rounded-full hover:bg-gray-700/80 group"
                    aria-label="Clear search history"
                    title="Clear search history"
                >
                    <TrashIcon className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
                </button>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
            {searchHistory.map((query) => (
                <button
                key={query}
                onClick={() => handleExampleClick(query)}
                className="px-3 py-1.5 bg-gray-800/60 rounded-full text-sm text-gray-400 hover:bg-gray-700/80 hover:text-gray-300 transition-colors"
                >
                {query}
                </button>
            ))}
            </div>
        </div>
      )}

      <div className="mt-8 text-gray-500">
        <p className="mb-3 text-sm">Or try searching for:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {exampleSearches.map((query) => (
            <button
              key={query}
              onClick={() => handleExampleClick(query)}
              className="px-3 py-1.5 bg-gray-800/60 rounded-full text-sm text-gray-400 hover:bg-gray-700/80 hover:text-gray-300 transition-colors"
            >
              {query}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Welcome;