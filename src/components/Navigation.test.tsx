import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Navigation } from './Navigation';

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, ...props }: { children: React.ReactNode } & any) => (
    <a {...props}>{children}</a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

describe('Navigation', () => {
  it('renders navigation links', () => {
    render(<Navigation />);
    
    expect(screen.getByText('Home')).toHaveAttribute('href', '/');
    expect(screen.getByText('Products')).toHaveAttribute('href', '/products');
    expect(screen.getByText('Login')).toHaveAttribute('href', '/login');
  });

  it('renders correct number of links', () => {
    render(<Navigation />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
  });

  it('applies correct styles to active link', () => {
    const usePathnameMock = jest.requireMock('next/navigation').usePathname;
    usePathnameMock.mockReturnValue('/products');

    render(<Navigation />);
    
    const productsLink = screen.getByText('Products');
    expect(productsLink.className).toContain('font-bold');
    expect(screen.getByText('Home').className).not.toContain('font-bold');
    expect(screen.getByText('Login').className).not.toContain('font-bold');
  });
});