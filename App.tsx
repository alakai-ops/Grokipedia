// Fix: Implement the main App component and state management logic.
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Welcome from './components/Welcome';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import ArticleDisplay from './components/ArticleDisplay';
import SavedArticles from './components/SavedArticles';
import MindMap from './components/MindMap';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorReport from './components/ErrorReport';
import SaveOptionsModal from './components/SaveOptionsModal';
import * as geminiService from './services/geminiService';
import * as exportService from './services/exportService';
import type { SearchResult, ArticleData, SavedArticle, MindMapData, ErrorReportData } from './types';

type View = 'welcome' | 'searching' | 'results' | 'article' | 'saved' | 'mindmap';

const ITEMS_PER_PAGE = 10;
const MAX_HISTORY_ITEMS = 15;

const AppComponent: React.FC = () => {
  const [view, setView] = useState<View>('welcome');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [totalHits, setTotalHits] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentArticle, setCurrentArticle] = useState<ArticleData | null>(null);
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [mindMapCenterNode, setMindMapCenterNode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveModalArticle, setSaveModalArticle] = useState<ArticleData | null>(null);
  const [canShare, setCanShare] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);


  useEffect(() => {
    try {
      const storedArticles = localStorage.getItem('grokipedia-saved');
      if (storedArticles) {
        setSavedArticles(JSON.parse(storedArticles));
      }
       const storedHistory = localStorage.getItem('grokipedia-history');
      if (storedHistory) {
        setSearchHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load from local storage:", e);
    }
    setCanShare(!!navigator.share);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('grokipedia-saved', JSON.stringify(savedArticles));
    } catch (e) {
      console.error("Failed to save articles:", e);
    }
  }, [savedArticles]);
  
  useEffect(() => {
    try {
      localStorage.setItem('grokipedia-history', JSON.stringify(searchHistory));
    } catch (e) {
      console.error("Failed to save history:", e);
    }
  }, [searchHistory]);

  const handleSearch = useCallback(async (searchQuery: string, page: number = 1) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setQuery(searchQuery);
    setCurrentPage(page);
    setView('searching');
    
    // Update search history
    const trimmedQuery = searchQuery.trim();
    setSearchHistory(prev => {
        const newHistory = [trimmedQuery, ...prev.filter(item => item.toLowerCase() !== trimmedQuery.toLowerCase())];
        return newHistory.slice(0, MAX_HISTORY_ITEMS);
    });
    
    const endpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&srlimit=${ITEMS_PER_PAGE}&sroffset=${(page - 1) * ITEMS_PER_PAGE}&format=json&origin=*`;

    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      if (data.error) throw new Error(data.error.info);
      
      setSearchResults(data.query.search);
      setTotalHits(data.query.searchinfo.totalhits);
      setView('results');
    } catch (e: any) {
      setError(`Failed to fetch search results. Please try again. Error: ${e.message}`);
      setView('welcome');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleArticleClick = useCallback(async (title: string) => {
    setIsLoading(true);
    setError(null);
    setQuery(title);
    setView('searching');

    const endpoint = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&prop=text&format=json&origin=*`;

    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      if (data.error) throw new Error(data.error.info);

      setCurrentArticle({ query: title, content: data.parse.text['*'] });
      setView('article');
    } catch (e: any) {
      setError(`Failed to load article: "${title}". Error: ${e.message}`);
      setView(searchResults.length > 0 ? 'results' : 'welcome');
    } finally {
      setIsLoading(false);
    }
  }, [searchResults.length]);

  const handleToggleBookmark = () => {
    if (!saveModalArticle) return;
    if (savedArticles.some(a => a.query === saveModalArticle.query)) {
      setSavedArticles(savedArticles.filter(a => a.query !== saveModalArticle.query));
    } else {
      setSavedArticles([...savedArticles, saveModalArticle]);
    }
  };

  const handleDownloadEpub = async () => {
    if (!saveModalArticle) return;
    await exportService.exportArticleAsEpub(saveModalArticle);
  };
  
  const handleShare = async () => {
    if (!currentArticle || !navigator.share) return;
    
    const shareData = {
      title: `Grokipedia: ${currentArticle.query}`,
      text: `Check out this Grokipedia article on "${currentArticle.query}"`,
      url: `https://grokipedia.com/page/${encodeURIComponent(currentArticle.query.replace(/ /g, '_'))}`
    };

    try {
      await navigator.share(shareData);
    } catch (err) {
      console.error("Share failed:", err);
      // Fail silently as the user may have cancelled the share action
    }
  };

  const handleViewSavedArticle = (article: SavedArticle) => {
    setCurrentArticle(article);
    setQuery(article.query);
    setView('article');
  };
  
  const handleRemoveSavedArticle = (articleQuery: string) => {
    setSavedArticles(savedArticles.filter(a => a.query !== articleQuery));
  };
  
  const handleExplore = useCallback(async (topic: string) => {
    setIsLoading(true);
    setError(null);
    const prevView = view;
    setView('searching');
    setMindMapCenterNode(topic);
    try {
        const data = await geminiService.generateMindMap(topic);
        setMindMapData(data);
        setView('mindmap');
    } catch (e: any) {
        setError(e.message || "An unknown error occurred while exploring topics.");
        setView(prevView);
    } finally {
        setIsLoading(false);
    }
  }, [view]);

  const handleBack = () => {
    setError(null);
    switch (view) {
      case 'article':
        setView(searchResults.length > 0 ? 'results' : 'welcome');
        setCurrentArticle(null);
        break;
      case 'results':
      case 'saved':
      case 'mindmap':
        setView('welcome');
        setQuery('');
        setSearchResults([]);
        break;
      default:
        setView('welcome');
    }
  };
  
  const handleClearHistory = () => {
    setSearchHistory([]);
  };
  
  const renderContent = () => {
    if (isLoading && view === 'searching') return <LoadingSpinner />;
    
    switch (view) {
      case 'welcome':
        return (
          <Welcome
            onSearch={(q) => handleSearch(q, 1)}
            isLoading={isLoading}
            searchHistory={searchHistory}
            onClearHistory={handleClearHistory}
          />
        );
      case 'results':
        return (
          <>
            <div className="mb-8"><SearchBar onSearch={(q) => handleSearch(q, 1)} isLoading={isLoading} initialQuery={query} searchHistory={searchHistory} /></div>
            <SearchResults 
              query={query}
              results={searchResults}
              totalHits={totalHits}
              currentPage={currentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              onArticleClick={handleArticleClick}
              onPageChange={(page) => handleSearch(query, page)}
            />
          </>
        );
      case 'article':
        return currentArticle ? <ArticleDisplay article={currentArticle} onLinkClick={handleArticleClick} /> : <LoadingSpinner />;
      case 'saved':
        return <SavedArticles articles={savedArticles} onView={handleViewSavedArticle} onRemove={handleRemoveSavedArticle} onExplore={handleExplore}/>;
      case 'mindmap':
        return mindMapData ? <MindMap centerNode={mindMapCenterNode} data={mindMapData} /> : <LoadingSpinner />;
      default:
        return (
          <Welcome
            onSearch={(q) => handleSearch(q, 1)}
            isLoading={isLoading}
            searchHistory={searchHistory}
            onClearHistory={handleClearHistory}
          />
        );
    }
  };

  const isArticleSaved = currentArticle ? savedArticles.some(a => a.query === currentArticle.query) : false;

  return (
    <div className="min-h-screen bg-[#121212] text-white selection:bg-gray-700">
      <Header
        onLogoClick={() => { setView('welcome'); setQuery(''); }}
        onSavedClick={() => setView('saved')}
        onBackClick={handleBack}
        showBack={view === 'article' || view === 'results' || view === 'saved' || view === 'mindmap'}
        onSaveClick={() => setSaveModalArticle(currentArticle)}
        showSave={view === 'article'}
        isSaved={isArticleSaved}
        onExploreClick={() => currentArticle && handleExplore(currentArticle.query)}
        showExplore={view === 'article'}
        onShareClick={handleShare}
        showShare={view === 'article' && canShare}
      />
      <main className="max-w-3xl mx-auto px-4 pt-24 pb-12">
        {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg mb-6">{error}</div>}
        {renderContent()}
      </main>
      {saveModalArticle && (
        <SaveOptionsModal
          isOpen={!!saveModalArticle}
          onClose={() => setSaveModalArticle(null)}
          isSaved={savedArticles.some(a => a.query === saveModalArticle.query)}
          onToggleBookmark={handleToggleBookmark}
          onDownloadEpub={handleDownloadEpub}
          onViewSaved={() => {
            setView('saved');
            setSaveModalArticle(null);
          }}
        />
      )}
    </div>
  );
};

class ErrorBoundary extends React.Component<{children: React.ReactNode}, { report: ErrorReportData | null }> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { report: null };
  }

  static getDerivedStateFromError(error: Error) {
    // This will be caught by componentDidCatch to get more info
    return {};
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({
        report: {
            error: error.toString(),
            componentStack: errorInfo.componentStack || 'N/A',
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            details: ''
        }
    });
  }

  render() {
    if (this.state.report) {
      return (
        <div className="min-h-screen bg-[#121212] flex items-center justify-center">
            <ErrorReport report={this.state.report} onClose={() => this.setState({ report: null })} />
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => (
    <ErrorBoundary>
        <AppComponent />
    </ErrorBoundary>
);

export default App;