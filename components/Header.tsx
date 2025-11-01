import React from 'react';
import GrokipediaIcon from './icons/GrokipediaIcon';
import BookmarkIcon from './icons/BookmarkIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import MindMapIcon from './icons/MindMapIcon';
import ShareIcon from './icons/ShareIcon';

interface HeaderProps {
  onLogoClick: () => void;
  onSavedClick: () => void;
  onBackClick: () => void;
  showBack: boolean;
  onSaveClick: () => void;
  showSave: boolean;
  isSaved: boolean;
  onExploreClick: () => void;
  showExplore: boolean;
  onShareClick: () => void;
  showShare: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onLogoClick,
  onSavedClick,
  onBackClick,
  showBack,
  onSaveClick,
  showSave,
  isSaved,
  onExploreClick,
  showExplore,
  onShareClick,
  showShare,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            {showBack ? (
              <button
                onClick={onBackClick}
                className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                aria-label="Back"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
            ) : (
              <button onClick={onLogoClick} className="flex items-center space-x-2" aria-label="Home">
                <GrokipediaIcon className="w-8 h-8" />
                <span className="text-xl font-bold">Grokipedia</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
             {showShare && (
                <button
                    onClick={onShareClick}
                    className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                    aria-label="Share article"
                    title="Share article"
                >
                    <ShareIcon className="w-6 h-6" />
                </button>
            )}
             {showExplore && (
                <button
                    onClick={onExploreClick}
                    className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                    aria-label="Explore related topics"
                    title="Explore related topics"
                >
                    <MindMapIcon className="w-6 h-6" />
                </button>
            )}
            {showSave && (
                <button
                    onClick={onSaveClick}
                    className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                    aria-label={isSaved ? "Unsave article" : "Save article"}
                    title={isSaved ? "Unsave article" : "Save article"}
                >
                    <BookmarkIcon filled={isSaved} className="w-6 h-6" />
                </button>
            )}
            
            <button
                onClick={onSavedClick}
                className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                aria-label="View saved articles"
                title="View saved articles"
            >
                <BookmarkIcon filled={false} className={`w-6 h-6 ${showSave ? 'hidden' : 'block'}`} />
            </button>
            
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;