// Fix: Remove redundant back button and rely on the global header for navigation.
import React from 'react';
import type { MindMapData } from '../types';

interface MindMapProps {
  centerNode: string;
  data: MindMapData;
}

const MindMapCategory: React.FC<{ title: string; items: string[]; color: string }> = ({ title, items, color }) => (
  <div className={`bg-gray-800/40 p-4 rounded-lg border-t-4 ${color} border-gray-700`}>
    <h3 className="font-bold text-gray-200 text-lg mb-3 text-center">{title}</h3>
    <div className="flex flex-col items-center gap-2">
      {items.map(item => {
        const url = `https://grokipedia.com/page/${encodeURIComponent(item.replace(/ /g, '_'))}`;
        return (
          <a
            key={item}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full block text-center px-3 py-2 bg-gray-700/60 rounded-md hover:bg-gray-700 text-gray-300 transition-colors capitalize"
          >
            {item}
          </a>
        );
      })}
    </div>
  </div>
);

const MindMap: React.FC<MindMapProps> = ({ centerNode, data }) => {
  return (
    <div className="animate-fade-in space-y-6 w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-gray-200 mb-6">
        Explore: <span className="text-gray-100 font-semibold capitalize">{centerNode}</span>
      </h2>

      <div className="text-center my-6">
        <div className="inline-block px-6 py-3 bg-gray-700 text-white rounded-full text-xl font-bold shadow-lg capitalize">
          {centerNode}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-sm">
        <MindMapCategory title="Foundational" items={data.foundational} color="border-gray-500" />
        <MindMapCategory title="Deeper Dive" items={data.deeperDive} color="border-gray-500" />
        <MindMapCategory title="Related Branches" items={data.relatedBranches} color="border-gray-500" />
      </div>
    </div>
  );
};

export default MindMap;