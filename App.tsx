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
import ErrorDisplay from './components/ErrorReport';
import SaveOptionsModal from './components/SaveOptionsModal';
import * as geminiService from './services/geminiService';
import * as exportService from './services/exportService';
import * as grokipediaService from './services/grokipediaService';
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
  const [globalError, setGlobalError] = useState<ErrorReportData | null>(null);
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
    setGlobalError(null);
    setQuery(searchQuery);
    setCurrentPage(page);
    setView('searching');
    
    const trimmedQuery = searchQuery.trim();
    setSearchHistory(prev => {
        const newHistory = [trimmedQuery, ...prev.filter(item => item.toLowerCase() !== trimmedQuery.toLowerCase())];
        return newHistory.slice(0, MAX_HISTORY_ITEMS);
    });
    
    try {
      const searchData = await grokipediaService.search(searchQuery, page, ITEMS_PER_PAGE);
      setSearchResults(searchData.results);
      setTotalHits(searchData.totalHits);
      setView('results');
    } catch (e: any) {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const searchUrl = `${grokipediaService.BASE_URL}/w/index.php?search=${encodeURIComponent(searchQuery)}&limit=${ITEMS_PER_PAGE}&offset=${offset}`;
      setGlobalError({
        error: `Failed to fetch search results for "${searchQuery}". The website might be temporarily unavailable or has changed its structure.`,
        rawError: e.toString(),
        targetUrl: searchUrl,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        details: ''
      });
      setView('welcome');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleArticleClick = useCallback(async (title: string) => {
    setIsLoading(true);
    setGlobalError(null);
    setQuery(title);
    setView('searching');

    try {
      const articleContent = await grokipediaService.fetchArticle(title);
      setCurrentArticle({ query: title, content: articleContent });
      setView('article');
    } catch (e: any) {
      const articleUrl = `${grokipediaService.BASE_URL}/page/${encodeURIComponent(title.replace(/ /g, '_'))}`;
      setGlobalError({
        error: `Failed to load the article "${title}". It might not exist or there was a network issue.`,
        rawError: e.toString(),
        targetUrl: articleUrl,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        details: ''
      });
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
    setGlobalError(null);
    const prevView = view;
    setView('searching');
    setMindMapCenterNode(topic);
    try {
        const data = await geminiService.generateMindMap(topic);
        setMindMapData(data);
        setView('mindmap');
    } catch (e: any) {
        setGlobalError({
            error: "Failed to generate the mind map using the AI service.",
            rawError: e.toString(),
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            details: ''
        });
        setView(prevView);
    } finally {
        setIsLoading(false);
    }
  }, [view]);

  const handleBack = () => {
    setGlobalError(null);
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
        return <Welcome onSearch={(q) => handleSearch(q, 1)} isLoading={isLoading} searchHistory={searchHistory} onClearHistory={handleClearHistory}/>;
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
        return <Welcome onSearch={(q) => handleSearch(q, 1)} isLoading={isLoading} searchHistory={searchHistory} onClearHistory={handleClearHistory} />;
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
        {renderContent()}
      </main>
      {globalError && (
          <ErrorDisplay 
            report={globalError} 
            onClose={() => setGlobalError(null)} 
          />
      )}
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
    // This is a static method, so we can't do much here,
    // but it's required for the error boundary to trigger `componentDidCatch`.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught React error:", error, errorInfo);
    this.setState({
        report: {
            error: "A critical error occurred in the application's user interface.",
            rawError: error.toString(),
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
            <ErrorDisplay report={this.state.report} onClose={() => this.setState({ report: null })} />
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