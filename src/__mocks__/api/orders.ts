type OrderProduct = {
  id: number;
  quantity: number;
};

type Order = {
  id: number;
  userId: number;
  products: OrderProduct[];
};

export const fetchOrders = jest.fn((): Promise<Order[]> => {
  return Promise.resolve([
    {
      id: 1,
      userId: 1,
      products: [
        {
          id: 1,
          quantity: 2,
        },
      ],
    },
    {
      id: 2,
      userId: 2,
      products: [
        {
          id: 2,
          quantity: 1,
        },
      ],
    },
  ]);
});