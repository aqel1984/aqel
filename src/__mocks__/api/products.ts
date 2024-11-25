type Product = {
  id: number;
  name: string;
  price: number;
};

export const fetchProducts = jest.fn((): Promise<Product[]> => {
  return Promise.resolve([
    {
      id: 1,
      name: 'Product 1',
      price: 10.99,
    },
    {
      id: 2,
      name: 'Product 2',
      price: 9.99,
    },
    {
      id: 3,
      name: 'Product 3',
      price: 12.99,
    },
  ]);
});