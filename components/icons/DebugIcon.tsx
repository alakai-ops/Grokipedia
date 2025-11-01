import React from 'react';

const DebugIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        {...props}
    >
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM11.25 8.25V6m0 12v-2.25m6.364-3.364l1.591-1.591M5.636 18.364l1.591-1.591M18.364 5.636l-1.591 1.591M5.636 5.636l1.591 1.591M18 12h2.25M3.75 12H6" 
        />
    </svg>
);

export default DebugIcon;
