
import React from 'react';
import { cn } from '@/lib/utils';

export interface EcoLogoProps {
  className?: string;
}

export const EcoLogo = ({ className }: EcoLogoProps) => {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-0 bg-eco-green rounded-full opacity-20 animate-pulse-ring"></div>
      <div className="relative w-full h-full flex items-center justify-center bg-eco-green rounded-full shadow-lg">
        <svg 
          viewBox="0 0 24 24" 
          fill="none"
          className="w-1/2 h-1/2 text-white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M9 10H9.01" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M15 10H15.01" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M12 18V20" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};
