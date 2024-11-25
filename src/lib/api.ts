export interface Product {
  id: string;
  name: string;
  origin: string;
  grade: string;
  price_1kg: number;
  price_100kg: number;
  price_20ft: number;
  price_40ft: number;
  stock_quantity: number;
  harvested_date: string;
  imageUrl: string;
  description: string;
}

export async function fetchProducts(): Promise<Product[]> {
  console.log('Fetching products...');
  try {
    const response = await fetch('/api/products');
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Received data:', data);
    
    if (!Array.isArray(data)) {
      console.error('Invalid data format:', data);
      throw new Error('Invalid data format received from the server');
    }
    
    // Validate each product in the array
    const validatedProducts = data.map((item): Product => {
      if (
        typeof item.id !== 'string' ||
        typeof item.name !== 'string' ||
        typeof item.origin !== 'string' ||
        typeof item.grade !== 'string' ||
        typeof item.price_1kg !== 'number' ||
        typeof item.price_100kg !== 'number' ||
        typeof item.price_20ft !== 'number' ||
        typeof item.price_40ft !== 'number' ||
        typeof item.stock_quantity !== 'number' ||
        typeof item.harvested_date !== 'string' ||
        typeof item.imageUrl !== 'string' ||
        typeof item.description !== 'string'
      ) {
        throw new Error(`Invalid product data: ${JSON.stringify(item)}`);
      }
      return item;
    });

    return validatedProducts;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw new Error('An error occurred while fetching products');
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  console.log('Fetching product by ID:', id);
  try {
    const response = await fetch(`/api/products/${id}`);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Received data:', data);
    
    // Validate the product data
    if (
      typeof data.id !== 'string' ||
      typeof data.name !== 'string' ||
      typeof data.origin !== 'string' ||
      typeof data.grade !== 'string' ||
      typeof data.price_1kg !== 'number' ||
      typeof data.price_100kg !== 'number' ||
      typeof data.price_20ft !== 'number' ||
      typeof data.price_40ft !== 'number' ||
      typeof data.stock_quantity !== 'number' ||
      typeof data.harvested_date !== 'string' ||
      typeof data.imageUrl !== 'string' ||
      typeof data.description !== 'string'
    ) {
      throw new Error(`Invalid product data: ${JSON.stringify(data)}`);
    }
    
    return data as Product;
  } catch (error) {
    console.error('Failed to fetch product:', error);
    throw error;
  }
}