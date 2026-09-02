import React from 'react';

export default function LoadingSkeleton({ type = 'cards', count = 3 }) {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800/60 rounded-xl border border-slate-300 dark:border-slate-800 p-4">
            <div className="h-4 bg-slate-300 dark:bg-slate-700/60 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-slate-300 dark:bg-slate-700/60 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800/60 rounded-lg border border-slate-300 dark:border-slate-800"></div>
      ))}
    </div>
  );
}
