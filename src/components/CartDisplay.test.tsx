import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Cart } from './Cart';

// Define the CartItem type to match the context
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

// Mock the store module
const mockStore = {
  cartItems: [] as CartItem[],
  removeFromCart: jest.fn(),
  totalPrice: jest.fn(),
  updateQuantity: jest.fn()
};

jest.mock('@/context/CartContext', () => ({
  useCart: () => mockStore
}));

describe('Cart', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn()
  };

  beforeEach(() => {
    mockStore.cartItems = [];
    mockStore.removeFromCart.mockClear();
    mockStore.totalPrice.mockClear();
    mockStore.updateQuantity.mockClear();
    defaultProps.onClose.mockClear();
  });

  it('renders empty cart message when cart is empty', () => {
    mockStore.cartItems = [];
    mockStore.totalPrice.mockReturnValue(0);

    render(<Cart {...defaultProps} />);
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('renders single cart item correctly', () => {
    mockStore.cartItems = [{
      id: 1,
      name: 'Test Coffee',
      price: 10,
      quantity: 1
    }];
    mockStore.totalPrice.mockReturnValue(10);

    render(<Cart {...defaultProps} />);

    expect(screen.getByText('Test Coffee')).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument();
  });

  it('renders multiple cart items correctly', () => {
    mockStore.cartItems = [
      { id: 1, name: 'Test Coffee', price: 10, quantity: 1 },
      { id: 2, name: 'Test Tea', price: 15, quantity: 1 }
    ];
    mockStore.totalPrice.mockReturnValue(25);

    render(<Cart {...defaultProps} />);

    expect(screen.getByText('Test Coffee')).toBeInTheDocument();
    expect(screen.getByText('Test Tea')).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument();
    expect(screen.getByText('$15.00')).toBeInTheDocument();
  });

  it('handles item removal', () => {
    mockStore.cartItems = [{
      id: 1,
      name: 'Test Coffee',
      price: 10,
      quantity: 1
    }];
    mockStore.totalPrice.mockReturnValue(10);

    render(<Cart {...defaultProps} />);

    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    expect(mockStore.removeFromCart).toHaveBeenCalledWith(1);
  });

  it('handles quantity updates', () => {
    mockStore.cartItems = [{
      id: 1,
      name: 'Test Coffee',
      price: 10,
      quantity: 1
    }];
    mockStore.totalPrice.mockReturnValue(10);

    render(<Cart {...defaultProps} />);

    const increaseButton = screen.getByRole('button', { name: /increase/i });
    fireEvent.click(increaseButton);
    expect(mockStore.updateQuantity).toHaveBeenCalledWith(1, 2);

    const decreaseButton = screen.getByRole('button', { name: /decrease/i });
    fireEvent.click(decreaseButton);
    expect(mockStore.updateQuantity).toHaveBeenCalledWith(1, 0);
  });

  it('calls onClose when close button is clicked', () => {
    render(<Cart {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('does not render when isOpen is false', () => {
    render(<Cart {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Shopping Cart')).not.toBeInTheDocument();
  });
});