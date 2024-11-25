import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductsPage from '../app/products/page';

// Mock the API module
jest.mock('@/lib/api', () => ({
  fetchProducts: jest.fn().mockResolvedValue([
    {
      id: 1,
      name: 'Test Coffee',
      price_1kg: 29.99,
      imageUrl: '/test.jpg',
      origin: 'Test Origin'
    }
  ])
}));

describe('ProductsPage', () => {
  it('renders products correctly', async () => {
    const { container } = render(<ProductsPage />);
    
    // Check if heading is rendered
    const heading = await screen.findByRole('heading');
    expect(heading).toHaveTextContent('Our Products');

    // Wait for products to load and check their rendering
    const productElements = await screen.findAllByRole('listitem');
    expect(productElements).toHaveLength(1);

    // Check product details using container queries
    const productName = container.querySelector('h2');
    expect(productName).toHaveTextContent('Test Coffee');

    const priceElement = container.querySelector('.text-gray-600');
    expect(priceElement).toHaveTextContent('$29.99');

    const originElement = container.querySelector('.text-gray-500');
    expect(originElement).toHaveTextContent('Origin: Test Origin');
  });
});