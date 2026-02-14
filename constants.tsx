
import { Product } from './types';

export const CATEGORIES = [
  'All',
  'Electronics',
  'Fashion',
  'Home & Living',
  'Accessories',
  'Sports',
  'Beauty'
];

export const CATEGORY_IMAGES: Record<string, string> = {
  'All': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop',
  'Electronics': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
  'Fashion': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop',
  'Home & Living': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop',
  'Accessories': 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=800&auto=format&fit=crop',
  'Sports': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
  'Beauty': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop'
};

export const INITIAL_PRODUCTS: Product[] = [
  // Electronics
  { id: 'e1', name: 'Nebula Watch Pro', price: 499, description: 'Holographic display, 30-day battery.', category: 'Electronics', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop', stock: 12 },
  { id: 'e2', name: 'Quantum Pods', price: 299, description: 'Spatial noise cancellation.', category: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop', stock: 45 },
  { id: 'e3', name: 'Titanium Phone X', price: 1099, description: 'Aerospace-grade titanium build.', category: 'Electronics', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop', stock: 21 },
  { id: 'e4', name: 'Aether Tablet', price: 1299, description: 'The ultimate creative workstation.', category: 'Electronics', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop', stock: 8 },
  { id: 'e5', name: 'Zenith Laptop M2', price: 2499, description: 'Unrivaled power for pros.', category: 'Electronics', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop', stock: 5 },
  
  // Fashion
  { id: 'f1', name: 'Obsidian Trench Coat', price: 850, description: 'Waterproof smart fabric.', category: 'Fashion', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop', stock: 15 },
  { id: 'f2', name: 'Gravity Sneakers', price: 220, description: 'Reactive cushioning technology.', category: 'Fashion', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop', stock: 30 },
  { id: 'f3', name: 'Silk Verse Scarf', price: 120, description: 'Premium digital print silk.', category: 'Fashion', image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=800&auto=format&fit=crop', stock: 50 },
  { id: 'f4', name: 'Luxe Leather Jacket', price: 550, description: 'Hand-stitched Italian leather.', category: 'Fashion', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop', stock: 10 },
  { id: 'f5', name: 'Minimalist Tee', price: 45, description: 'Organic cotton, perfect fit.', category: 'Fashion', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop', stock: 100 },

  // Home & Living
  { id: 'h1', name: 'Zen Smart Lamp', price: 180, description: 'Circadian rhythm synchronization.', category: 'Home & Living', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop', stock: 25 },
  { id: 'h2', name: 'Aura Diffuser', price: 95, description: 'Ultrasonic scent tech.', category: 'Home & Living', image: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?q=80&w=800&auto=format&fit=crop', stock: 40 },
  { id: 'h3', name: 'Oak Desk', price: 1450, description: 'Sustainably sourced premium oak.', category: 'Home & Living', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=800&auto=format&fit=crop', stock: 5 },
  { id: 'h4', name: 'Abstract Ceramic Vase', price: 85, description: 'Handmade geometric art.', category: 'Home & Living', image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?q=80&w=800&auto=format&fit=crop', stock: 20 },

  // Accessories
  { id: 'a1', name: 'Prism Keyboard', price: 189, description: 'Mechanical RGB artistry.', category: 'Accessories', image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=800&auto=format&fit=crop', stock: 15 },
  { id: 'a2', name: 'Void Backpack', price: 350, description: 'RFID-blocking stealth fabric.', category: 'Accessories', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop', stock: 30 },
  { id: 'a3', name: 'Solar Charger', price: 120, description: 'Foldable high-output panels.', category: 'Accessories', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3', stock: 50 },

  // Beauty
  { id: 'b1', name: 'Midnight Serum', price: 145, description: 'Molecular cellular repair.', category: 'Beauty', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop', stock: 100 },
  { id: 'b2', name: 'Cryo Facial Roller', price: 75, description: 'Medical grade cooling.', category: 'Beauty', image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=800&auto=format&fit=crop', stock: 60 },

  // Sports
  { id: 's1', name: 'Neo Yoga Mat', price: 110, description: 'Non-slip smart texture.', category: 'Sports', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3', stock: 20 },
  { id: 's2', name: 'Carbon Racket', price: 340, description: 'Ultra-light professional tech.', category: 'Sports', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3', stock: 12 }
];

export const SALES_CHART_DATA = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];
