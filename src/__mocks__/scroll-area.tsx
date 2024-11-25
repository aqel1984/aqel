import React from 'react';

interface ScrollAreaProps {
  children: React.ReactNode;
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({ children }) => (
  <div data-testid="scroll-area" role="region" aria-label="Scrollable content">
    {children}
  </div>
);

export const ScrollBar: React.FC = () => (
  <div 
    data-testid="scroll-bar" 
    role="scrollbar" 
    aria-controls="scrollable-content"
    aria-valuenow={50}
    aria-valuemin={0}
    aria-valuemax={100}
  />
);