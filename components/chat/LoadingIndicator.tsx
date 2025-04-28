'use client'

import React from 'react';

export default function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="h-3 w-3 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="h-3 w-3 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="h-3 w-3 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );
}