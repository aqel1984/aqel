import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TestComponent from './TestComponent';
import { useCart } from '@/context/CartContext';

// Define types for testing
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

interface CartAction {
  type: 'ADD_ITEM' | 'REMOVE_ITEM' | 'CLEAR_CART' | 'UPDATE_QUANTITY';
  payload?: any;
}

interface CartContextType {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
}

jest.mock('@/context/CartContext', () => ({
  __esModule: true,
  useCart: jest.fn(),
}));

const mockUseCart = useCart as jest.MockedFunction<typeof useCart>;

describe('TestComponent', () => {
  const sampleCartItem: CartItem = {
    id: 1,
    name: 'Product 1',
    price: 100,
    quantity: 1
  };

  beforeEach(() => {
    mockUseCart.mockReturnValue({
      state: { items: [] },
      dispatch: jest.fn(),
      addItem: jest.fn(),
      removeItem: jest.fn(),
      clearCart: jest.fn(),
      getItemCount: jest.fn(() => 0)
    } as CartContextType);
  });

  it('renders correctly when cart is empty', () => {
    render(<TestComponent />);
    expect(screen.getByText('Cart Items')).toBeInTheDocument();
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add .* to cart/i })).toBeInTheDocument();
    expect(screen.getByText('Total Items: 0')).toBeInTheDocument();
    expect(screen.getByText('Total Price: $0.00')).toBeInTheDocument();
  });

  it('renders correctly when cart has items', () => {
    mockUseCart.mockReturnValue({
      state: { items: [sampleCartItem] },
      dispatch: jest.fn(),
      addItem: jest.fn(),
      removeItem: jest.fn(),
      clearCart: jest.fn(),
      getItemCount: jest.fn(() => 1)
    } as CartContextType);

    render(<TestComponent />);
    expect(screen.getByText('Product 1 - $100.00 x 1')).toBeInTheDocument();
    expect(screen.getByText('Total Items: 1')).toBeInTheDocument();
    expect(screen.getByText('Total Price: $100.00')).toBeInTheDocument();
  });

  it('handles adding items to cart', () => {
    const mockAddItem = jest.fn();
    mockUseCart.mockReturnValue({
      state: { items: [] },
      dispatch: jest.fn(),
      addItem: mockAddItem,
      removeItem: jest.fn(),
      clearCart: jest.fn(),
      getItemCount: jest.fn(() => 0)
    } as CartContextType);

    render(<TestComponent />);
    const addButton = screen.getByRole('button', { name: /add .* to cart/i });
    fireEvent.click(addButton);

    expect(mockAddItem).toHaveBeenCalledWith(sampleCartItem);
  });

  it('handles removing items from cart', () => {
    const mockRemoveItem = jest.fn();
    mockUseCart.mockReturnValue({
      state: { items: [sampleCartItem] },
      dispatch: jest.fn(),
      addItem: jest.fn(),
      removeItem: mockRemoveItem,
      clearCart: jest.fn(),
      getItemCount: jest.fn(() => 1)
    } as CartContextType);

    render(<TestComponent />);
    const removeButton = screen.getByRole('button', { name: /remove .* from cart/i });
    fireEvent.click(removeButton);

    expect(mockRemoveItem).toHaveBeenCalledWith(1);
  });
});