// Fix: Implement the ErrorReport component for displaying and analyzing errors.
import React, { useState } from 'react';
import type { ErrorReportData } from '../types';
import * as geminiService from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import DebugIcon from './icons/DebugIcon';
import CopyIcon from './icons/CopyIcon';
import CheckIcon from './icons/CheckIcon';
import { marked } from 'marked';


interface ErrorReportProps {
  report: ErrorReportData;
  onClose: () => void;
}

const ErrorReport: React.FC<ErrorReportProps> = ({ report, onClose }) => {
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
      setAnalysis('<p>Failed to analyze error. Please check the console for details.</p>');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleCopy = () => {
    const reportString = `
Error: ${report.error}
Timestamp: ${report.timestamp}
URL: ${report.url}
User Agent: ${report.userAgent}
Component Stack:
${report.componentStack}
    `;
    navigator.clipboard.writeText(reportString.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in-fast">
      <div className="bg-[#1e1e1e] border border-gray-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
             <DebugIcon className="w-6 h-6 text-yellow-400"/>
            <h2 className="text-xl font-semibold text-gray-200">Error Report</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-700"
            aria-label="Close error report"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="p-4 overflow-y-auto">
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="font-semibold text-red-400">Error Message</h3>
              <pre className="mt-1 p-2 bg-black/30 rounded text-sm whitespace-pre-wrap font-mono">{report.error}</pre>
            </div>
            <div>
              <h3 className="font-semibold text-gray-400">Component Stack</h3>
              <pre className="mt-1 p-2 bg-black/30 rounded text-sm whitespace-pre-wrap font-mono">{report.componentStack}</pre>
            </div>
            <details className="text-xs text-gray-500">
                <summary className="cursor-pointer">More Details</summary>
                <div className="pt-2 pl-4">
                    <p><strong>URL:</strong> {report.url}</p>
                    <p><strong>Timestamp:</strong> {report.timestamp}</p>
                    <p><strong>User Agent:</strong> {report.userAgent}</p>
                </div>
            </details>
          </div>
          
           <div className="mt-6 border-t border-gray-700 pt-4">
              <div className="flex items-center justify-between">
                 <h3 className="font-semibold text-gray-200">Gemini Analysis</h3>
                 <div className="flex items-center space-x-2">
                    <button onClick={handleCopy} className="p-2 rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-1.5 text-xs text-gray-400">
                        {copied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                        <span>{copied ? 'Copied!' : 'Copy Report'}</span>
                    </button>
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-500 disabled:opacity-50 disabled:cursor-wait transition-colors text-sm font-medium"
                    >
                        {isAnalyzing ? 'Analyzing...' : 'Analyze with Gemini'}
                    </button>
                 </div>
              </div>
              {isAnalyzing && <LoadingSpinner />}
              {analysis && (
                 <div
                    className="prose prose-sm prose-invert mt-4 max-w-none p-3 bg-black/30 rounded"
                    dangerouslySetInnerHTML={{ __html: analysis }}
                />
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorReport;
