export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}

export interface CartAction {
  type: 'ADD_ITEM' | 'REMOVE_ITEM' | 'CLEAR_CART' | 'UPDATE_QUANTITY';
  payload?: any;
}

export interface CartContextType {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
}
