import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Cart } from './Cart';
import { useCartStore } from '@/lib/store';

jest.mock('@/lib/store', () => ({
  useCartStore: jest.fn(),
}));

const mockProduct = {
  id: '1',
  name: 'Test Product',
  price: 10,
  quantity: 1,
};

const mockProduct2 = {
  id: '2',
  name: 'Another Product',
  price: 20,
  quantity: 2,
};

describe('Cart', () => {
  const mockRemoveItem = jest.fn();
  const mockUpdateItemQuantity = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [],
      removeItem: mockRemoveItem,
      updateItemQuantity: mockUpdateItemQuantity,
    });
  });

  it('shows empty cart message when cart is empty', () => {
    render(<Cart />);
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
  });

  it('displays single item with correct singular form', () => {
    (useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [mockProduct],
      removeItem: mockRemoveItem,
      updateItemQuantity: mockUpdateItemQuantity,
    });

    render(<Cart />);
    expect(screen.getByText('Your Cart (1 item)')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$10.00 x 1')).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument();
  });

  it('displays multiple items with correct plural form and total', () => {
    (useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [mockProduct, mockProduct2],
      removeItem: mockRemoveItem,
      updateItemQuantity: mockUpdateItemQuantity,
    });

    render(<Cart />);
    expect(screen.getByText('Your Cart (3 items)')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Another Product')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument(); // Total: $10 + (2 * $20)
  });

  it('handles quantity increase correctly', () => {
    (useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [mockProduct],
      removeItem: mockRemoveItem,
      updateItemQuantity: mockUpdateItemQuantity,
    });

    render(<Cart />);
    const increaseButton = screen.getByLabelText('Increase quantity of Test Product');
    fireEvent.click(increaseButton);
    expect(mockUpdateItemQuantity).toHaveBeenCalledWith('1', 2);
  });

  it('handles quantity decrease correctly when quantity > 1', () => {
    (useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [{ ...mockProduct, quantity: 2 }],
      removeItem: mockRemoveItem,
      updateItemQuantity: mockUpdateItemQuantity,
    });

    render(<Cart />);
    const decreaseButton = screen.getByLabelText('Decrease quantity of Test Product');
    expect(decreaseButton).not.toBeDisabled();
    fireEvent.click(decreaseButton);
    expect(mockUpdateItemQuantity).toHaveBeenCalledWith('1', 1);
  });

  it('disables decrease button when quantity is 1', () => {
    (useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [mockProduct],
      removeItem: mockRemoveItem,
      updateItemQuantity: mockUpdateItemQuantity,
    });

    render(<Cart />);
    const decreaseButton = screen.getByLabelText('Decrease quantity of Test Product');
    expect(decreaseButton).toBeDisabled();
  });

  it('handles item removal correctly', () => {
    (useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [mockProduct],
      removeItem: mockRemoveItem,
      updateItemQuantity: mockUpdateItemQuantity,
    });

    render(<Cart />);
    const removeButton = screen.getByLabelText('Remove Test Product from cart');
    fireEvent.click(removeButton);
    expect(mockRemoveItem).toHaveBeenCalledWith('1');
  });

  it('displays checkout button', () => {
    (useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [mockProduct],
      removeItem: mockRemoveItem,
      updateItemQuantity: mockUpdateItemQuantity,
    });

    render(<Cart />);
    expect(screen.getByText('Checkout')).toBeInTheDocument();
  });
});