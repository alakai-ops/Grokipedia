import React, { useState, useEffect } from 'react';
import SearchIcon from './icons/SearchIcon';
import UpArrowIcon from './icons/UpArrowIcon';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  initialQuery?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, initialQuery = '' }) => {
  const [inputValue, setInputValue] = useState(initialQuery);

  useEffect(() => {
    setInputValue(initialQuery);
  }, [initialQuery]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSearch(inputValue);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-center">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search Grokipedia..."
            className="w-full pl-11 pr-12 py-3 text-base bg-[#1F1F1F] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors duration-200 text-gray-100 placeholder-gray-500"
            disabled={isLoading}
            autoComplete="off"
          />
          <button
            type="submit"
            className="absolute inset-y-0 right-0 mr-2 flex items-center justify-center h-8 w-8 my-auto bg-gray-600/50 rounded-full hover:bg-gray-500 transition-colors"
            disabled={isLoading}
            aria-label="Search"
          >
            <UpArrowIcon className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
