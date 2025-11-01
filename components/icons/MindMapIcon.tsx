import React from 'react';

const MindMapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={`text-gray-400 ${props.className || ''}`}
        {...props}
    >
        <path d="M12 2a2 2 0 012 2v1m0 0a2 2 0 01-2 2h-1a2 2 0 00-2 2v2a2 2 0 002 2h1a2 2 0 012 2v1m0 0a2 2 0 01-2 2m-2-4h-1a2 2 0 00-2 2v2a2 2 0 002 2h1m0-4a2 2 0 012-2m-2 4v4m0 0a2 2 0 01-2 2m-4-2a2 2 0 01-2-2v-1m0 0a2 2 0 012-2h1a2 2 0 002-2V8a2 2 0 00-2-2h-1a2 2 0 01-2-2V4a2 2 0 012-2m2 4h1a2 2 0 002-2V4a2 2 0 00-2-2h-1m0 4a2 2 0 01-2 2m2-4v4m0 0a2 2 0 01-2 2" />
    </svg>
);

export default MindMapIcon;