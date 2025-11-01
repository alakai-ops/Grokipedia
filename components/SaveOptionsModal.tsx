import React, { useState } from 'react';
import BookmarkIcon from './icons/BookmarkIcon';
import EpubIcon from './icons/EpubIcon';
import FolderIcon from './icons/FolderIcon';
import LoadingSpinner from './LoadingSpinner';

interface SaveOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleBookmark: () => void;
  onDownloadEpub: () => Promise<void>;
  onViewSaved: () => void;
}

type LoadingState = 'none' | 'epub';

const SaveOptionsModal: React.FC<SaveOptionsModalProps> = ({
  isOpen,
  onClose,
  isSaved,
  onToggleBookmark,
  onDownloadEpub,
  onViewSaved,
}) => {
  const [loading, setLoading] = useState<LoadingState>('none');

  const handleDownload = async (type: 'epub') => {
    setLoading(type);
    try {
      await onDownloadEpub();
    } catch (error) {
      console.error(`Failed to download ${type}`, error);
      // You could show an error message to the user here
    } finally {
      setLoading('none');
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in-fast"
      onClick={onClose}
    >
      <div
        className="bg-[#1e1e1e] border border-gray-700 rounded-lg shadow-2xl w-full max-w-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-center text-gray-200">Save Options</h2>
        </header>
        <div className="p-2">
          <ul className="space-y-1">
            <li>
              <button
                onClick={onToggleBookmark}
                className="w-full flex items-center space-x-3 text-left p-3 rounded-md hover:bg-gray-700/70 transition-colors"
              >
                <BookmarkIcon filled={isSaved} className="w-6 h-6 flex-shrink-0" />
                <span className="text-gray-200">{isSaved ? 'Remove Bookmark' : 'Bookmark in App'}</span>
              </button>
            </li>
             <li>
              <button
                onClick={() => handleDownload('epub')}
                disabled={loading !== 'none'}
                className="w-full flex items-center space-x-3 text-left p-3 rounded-md hover:bg-gray-700/70 transition-colors disabled:opacity-50"
              >
                {loading === 'epub' ? <LoadingSpinner /> : <EpubIcon className="w-6 h-6 flex-shrink-0 text-gray-400" />}
                <span className="text-gray-200">Download as EPUB</span>
              </button>
            </li>
             <li>
              <button
                onClick={onViewSaved}
                className="w-full flex items-center space-x-3 text-left p-3 rounded-md hover:bg-gray-700/70 transition-colors"
              >
                <FolderIcon className="w-6 h-6 flex-shrink-0 text-gray-400" />
                <span className="text-gray-200">View Saved Articles</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SaveOptionsModal;