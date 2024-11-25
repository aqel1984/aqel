import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProductCard } from './ProductCard';

// Mock the entire store module
jest.mock('@/lib/store', () => ({
  useCartStore: jest.fn(),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || 'Product image'} />;
  },
}));

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    description: 'This is a test product',
    price_1kg: 10,
    imageUrl: '/test-image.jpg',
  };

  const mockAddItem = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up the mock implementation for useCartStore
    (jest.requireMock('@/lib/store').useCartStore as jest.Mock).mockReturnValue({
      addItem: mockAddItem,
    });
  });

  it('renders correctly', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$10.00 per kg')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', '/test-image.jpg');
    expect(screen.getByRole('button', { name: 'Add Test Product to cart' })).toBeInTheDocument();
  });

  it('renders correctly with minimal props', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$10.00 per kg')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', '/test-image.jpg');
    expect(screen.getByRole('button', { name: 'Add Test Product to cart' })).toBeInTheDocument();
    
    // Check default values for optional fields
    expect(screen.getByText('Origin: Unknown, Grade: Unspecified')).toBeInTheDocument();
    expect(screen.getByText('Stock: Unknown')).toBeInTheDocument();
  });

  it('renders correctly with all optional props', () => {
    const fullProduct = {
      ...mockProduct,
      origin: 'Brazil',
      grade: 'Premium',
      stock_quantity: 100,
      harvested_date: '2024-01-15',
    };

    render(<ProductCard product={fullProduct} />);

    expect(screen.getByText('Origin: Brazil, Grade: Premium')).toBeInTheDocument();
    expect(screen.getByText('Stock: 100 kg')).toBeInTheDocument();
    expect(screen.getByText(`Harvested: ${new Date('2024-01-15').toLocaleDateString()}`)).toBeInTheDocument();
  });

  it('handles missing image URL and image errors', () => {
    const productWithoutImage = {
      ...mockProduct,
      imageUrl: '',
    };

    render(<ProductCard product={productWithoutImage} />);
    
    // Check if placeholder is used when imageUrl is empty
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/placeholder.svg?height=200&width=200');

    // Simulate image error
    fireEvent.error(img);
    expect(img).toHaveAttribute('src', '/placeholder.svg?height=200&width=200');
  });

  it('calls addItem when "Add to Cart" button is clicked', () => {
    render(<ProductCard product={mockProduct} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add Test Product to cart' }));

    expect(mockAddItem).toHaveBeenCalledWith({
      id: mockProduct.id,
      name: mockProduct.name,
      price: mockProduct.price_1kg,
      quantity: 1,
    });
  });

  it('handles image load error', () => {
    render(<ProductCard product={mockProduct} />);

    const img = screen.getByRole('img');
    fireEvent.error(img);

    expect(img).toHaveAttribute('src', '/placeholder.svg?height=200&width=200');
  });
});