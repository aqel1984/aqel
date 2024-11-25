'use client';

import React, { ReactNode } from 'react';
import ClientErrorBoundary from './ClientErrorBoundary';

interface ParentComponentProps {
  children: ReactNode;
}

const ParentComponent: React.FC<ParentComponentProps> = ({ children }) => {
  return (
    <ClientErrorBoundary fallback={
      <div role="alert" aria-live="assertive">
        <h2>Error</h2>
        <p>Something went wrong. Please try again later.</p>
      </div>
    }>
      <main className="parent-component">
        {children}
      </main>
    </ClientErrorBoundary>
  );
};

export default ParentComponent;