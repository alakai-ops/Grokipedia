import React, { useState } from 'react';
import { marked } from 'marked';
import type { ArticleData } from '../types';
import * as geminiService from '../services/geminiService';
import DebugIcon from './icons/DebugIcon';
import LoadingSpinner from './LoadingSpinner';

const VisualIssueReporter: React.FC<{ article: ArticleData }> = ({ article }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return;
        setIsAnalyzing(true);
        setAnalysis('');
        try {
            const result = await geminiService.analyzeVisualIssue({
                articleTitle: article.query,
                articleHtml: article.content,
                userDescription: description,
            });
            const html = await marked.parse(result);
            setAnalysis(html);
        } catch (err) {
            setAnalysis('<p>Failed to analyze issue. Please check the console for details.</p>');
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const handleClose = () => {
        setIsOpen(false);
        // Delay resetting state to allow for closing animation
        setTimeout(() => {
            setDescription('');
            setAnalysis('');
            setIsAnalyzing(false);
        }, 300);
    }
    
    const renderContent = () => {
        if (isAnalyzing) {
            return <LoadingSpinner />;
        }
        if (analysis) {
            return (
                <div className="mt-4">
                    <h3 className="font-semibold text-gray-200 mb-2">Gemini Analysis</h3>
                    <div
                        className="prose prose-sm prose-invert max-w-none p-3 bg-black/30 rounded text-gray-300"
                        dangerouslySetInnerHTML={{ __html: analysis }}
                    />
                </div>
            );
        }
        return (
            <form onSubmit={handleSubmit} className="mt-4">
                <label htmlFor="issue-description" className="block mb-2 text-sm font-medium text-gray-300">
                    Please describe the visual problem:
                </label>
                <textarea
                    id="issue-description"
                    rows={4}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full p-2.5 text-sm bg-[#2a2a2a] border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="e.g., 'The image on the right is overlapping the main text.'"
                    required
                />
                <button
                    type="submit"
                    disabled={isAnalyzing || !description.trim()}
                    className="mt-4 w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 disabled:opacity-50 disabled:cursor-wait transition-colors font-medium"
                >
                    Analyze Issue with Gemini
                </button>
            </form>
        );
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-transform transform hover:scale-110 z-20"
                aria-label="Report an issue"
                title="Report an issue"
            >
                <DebugIcon className="w-6 h-6" />
            </button>
            
            {isOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in-fast" onClick={handleClose}>
                    <div className="bg-[#1e1e1e] border border-gray-700 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <header className="flex items-center justify-between p-4 border-b border-gray-700">
                            <div className="flex items-center space-x-3">
                                <DebugIcon className="w-6 h-6 text-yellow-400"/>
                                <h2 className="text-xl font-semibold text-gray-200">Report an Issue</h2>
                            </div>
                            <button onClick={handleClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700" aria-label="Close">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </header>
                        <div className="p-6 overflow-y-auto">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default VisualIssueReporter;