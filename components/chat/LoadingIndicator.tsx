'use client'

import React from 'react';
import Image from 'next/image';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start w-full">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mr-2">
        <Image 
          src="/images/logo-dark.svg" 
          alt="Lighted" 
          width={16} 
          height={16} 
          className="hidden dark:block" 
        />
        <Image 
          src="/images/logo-light.svg" 
          alt="Lighted" 
          width={16} 
          height={16} 
          className="block dark:hidden" 
        />
      </div>
      <div className="bg-white dark:bg-gray-800/40 border border-gray-100/30 dark:border-gray-700/30 rounded-2xl px-4 py-3 text-gray-800 dark:text-gray-100 shadow-md backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-150"></div>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-300"></div>
          </div>
          <span className="text-sm font-medium">Preparing sermon</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;