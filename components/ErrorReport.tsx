// Fix: Implement the ErrorReport component for displaying and analyzing errors.
import React, { useState } from 'react';
import type { ErrorReportData } from '../types';
import * as geminiService from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import DebugIcon from './icons/DebugIcon';
import CopyIcon from './icons/CopyIcon';
import CheckIcon from './icons/CheckIcon';
import { marked } from 'marked';


interface ErrorDisplayProps {
  report: ErrorReportData;
  onClose: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ report, onClose }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysis('');
    try {
      const result = await geminiService.analyzeError(report);
      const html = await marked.parse(result);
      setAnalysis(html);
    } catch (err) {
      setAnalysis('<p class="text-red-400">Failed to analyze error. The AI service may be unavailable.</p>');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleCopy = () => {
    const reportString = `
## Grokipedia Error Report

**Message:**
${report.error}

**Raw Error:**
${report.rawError || 'N/A'}

**Failed URL:** ${report.targetUrl || 'N/A'}

**Scraping Trace:**
- Stage: ${report.scrapingStage || 'N/A'}
- Selector: \`${report.failedSelector || 'N/A'}\`

**Timestamp:** ${report.timestamp}
**App URL:** ${report.url}
**User Agent:** ${report.userAgent}

**Component Stack:**
\`\`\`
${report.componentStack || 'N/A'}
\`\`\`

**Raw HTML Snippet (first 1000 chars):**
\`\`\`html
${(report.rawHtmlSnippet || 'N/A').substring(0, 1000)}
\`\`\`
    `;
    navigator.clipboard.writeText(reportString.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in-fast">
      <div className="bg-[#1e1e1e] border border-red-900/50 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
             <DebugIcon className="w-6 h-6 text-red-400"/>
            <h2 className="text-xl font-semibold text-gray-200">Application Error</h2>
          </div>
        </header>

        <div className="p-6 overflow-y-auto space-y-4">
            <p className="text-gray-300 bg-red-900/30 p-3 rounded-md border border-red-800/50">{report.error}</p>
          
            <details className="text-sm text-gray-400 bg-black/30 p-3 rounded-md">
                <summary className="cursor-pointer font-medium hover:text-gray-200">Show Technical Details</summary>
                <div className="pt-3 mt-2 border-t border-gray-700/50 space-y-2 font-mono text-xs">
                    {report.scrapingStage && <div><strong className="text-gray-500">Scraping Stage:</strong> <pre className="whitespace-pre-wrap">{report.scrapingStage}</pre></div>}
                    {report.failedSelector && <div><strong className="text-gray-500">Failed Selector:</strong> <pre className="whitespace-pre-wrap">{report.failedSelector}</pre></div>}
                    {report.rawError && <div><strong className="text-gray-500">Raw Error:</strong> <pre className="whitespace-pre-wrap">{report.rawError}</pre></div>}
                    {report.targetUrl && <div><strong className="text-gray-500">Target URL:</strong> <pre className="whitespace-pre-wrap break-all">{report.targetUrl}</pre></div>}
                    {report.componentStack && <div><strong className="text-gray-500">Component Stack:</strong> <pre className="whitespace-pre-wrap">{report.componentStack}</pre></div>}
                    {report.rawHtmlSnippet && <div><strong className="text-gray-500">Raw HTML Snippet:</strong> <pre className="whitespace-pre-wrap bg-black/50 p-2 rounded mt-1">{report.rawHtmlSnippet.substring(0, 1000)}...</pre></div>}
                    <div><strong className="text-gray-500">App URL:</strong> {report.url}</div>
                    <div><strong className="text-gray-500">Timestamp:</strong> {report.timestamp}</div>
                    <div><strong className="text-gray-500">User Agent:</strong> {report.userAgent}</div>
                </div>
            </details>
          
           <div className="border-t border-gray-700 pt-4">
              <h3 className="font-semibold text-gray-200 mb-2">Diagnostics</h3>
              {isAnalyzing ? <LoadingSpinner /> : (
                analysis ? (
                 <div
                    className="prose prose-sm prose-invert mt-2 max-w-none p-3 bg-black/30 rounded"
                    dangerouslySetInnerHTML={{ __html: analysis }}
                />
                ) : (
                <p className="text-sm text-gray-500">Use Gemini to get a technical analysis of this error.</p>
                )
              )}
           </div>
        </div>

        <footer className="flex items-center justify-between p-4 border-t border-gray-700 bg-black/20">
            <div className="flex items-center space-x-2">
                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-500 disabled:opacity-50 disabled:cursor-wait transition-colors text-sm font-medium"
                >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze with Gemini'}
                </button>
                 <button onClick={handleCopy} className="px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-1.5 text-xs text-gray-400 border border-gray-600">
                    {copied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy Full Report'}</span>
                </button>
            </div>
             <div className="flex items-center space-x-2">
                 <button
                    onClick={() => window.location.reload()}
                    className="px-3 py-1.5 bg-blue-800/50 text-blue-200 rounded-md hover:bg-blue-800 transition-colors text-sm font-medium"
                >
                    Reload App
                </button>
                <button
                    onClick={onClose}
                    className="px-3 py-1.5 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                    Close
                </button>
             </div>
        </footer>
      </div>
    </div>
  );
};

export default ErrorDisplay;