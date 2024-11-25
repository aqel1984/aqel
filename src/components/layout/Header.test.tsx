import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';
import { useTheme } from 'next-themes';
import { useCart } from '@/context/CartContext';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

// Mock CartContext
jest.mock('@/context/CartContext', () => ({
  useCart: jest.fn(),
}));

const mockUseTheme = useTheme as jest.Mock;
const mockUseCart = useCart as jest.Mock;

describe('Header', () => {
  beforeEach(() => {
    // Mock useTheme implementation
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
    });

    // Mock useCart implementation
    mockUseCart.mockReturnValue({
      state: {
        cartItems: [],
      },
    });
  });

  it('renders without crashing', () => {
    render(<Header />);
    expect(screen.getByText('My Store')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Header />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renders theme toggle button', () => {
    render(<Header />);
    expect(screen.getByRole('button', { name: 'Toggle theme' })).toBeInTheDocument();
  });

  it('renders shopping cart button', () => {
    render(<Header />);
    expect(screen.getByRole('button', { name: 'Shopping cart' })).toBeInTheDocument();
  });

  it('displays cart item count when items are present', () => {
    mockUseCart.mockReturnValue({
      state: {
        cartItems: [{ id: 1, quantity: 2 }],
      },
    });

    render(<Header />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('applies mobile layout styles', () => {
    render(<Header />);
    
    const navLinks = screen.getByText('Home').parentElement;
    expect(navLinks).toHaveClass('hidden', 'space-x-8', 'lg:block');
  });

  it('handles theme toggle from light to dark', () => {
    const setTheme = jest.fn();
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme,
    });

    render(<Header />);
    const themeToggle = screen.getByRole('button', { name: 'Toggle theme' });
    themeToggle.click();

    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('handles theme toggle from dark to light', () => {
    const setTheme = jest.fn();
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme,
    });

    render(<Header />);
    const themeToggle = screen.getByRole('button', { name: 'Toggle theme' });
    themeToggle.click();

    expect(setTheme).toHaveBeenCalledWith('light');
  });

  it('renders sun icon in dark mode', () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: jest.fn(),
    });

    render(<Header />);
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
  });

  it('renders moon icon in light mode', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
    });

    render(<Header />);
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
  });
});