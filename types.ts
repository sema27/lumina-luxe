
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  stock: number;
}

export interface Address {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  city: string;
  details: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  avatar?: string;
  phone?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type View = 'home' | 'shop' | 'admin' | 'cart' | 'login' | 'register' | 'favorites' | 'checkout' | 'profile' | 'orders' | 'manifesto';

export interface AppState {
  products: Product[];
  cart: CartItem[];
  favorites: string[];
  view: View;
  user: User | null;
  addresses: Address[];
  orders: Order[];
}
