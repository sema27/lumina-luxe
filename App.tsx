
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, LayoutDashboard, Home, ShoppingBag, Plus, Minus, Trash2, 
  ArrowLeft, Send, Sparkles, TrendingUp, Search, Heart, User as UserIcon,
  LogOut, Mail, Lock, UserPlus, LogIn, ChevronRight, CheckCircle, CreditCard,
  Truck, ShieldCheck, MapPin, Package, Settings, Edit3, X, Bell, Globe, Camera, Eye, EyeOff,
  Zap, Flame, Star, ZapOff, ScrollText, Binary, Cpu, Save
} from 'lucide-react';
import { Product, CartItem, View, User, Address, Order } from './types';
import { INITIAL_PRODUCTS, CATEGORIES, CATEGORY_IMAGES, SALES_CHART_DATA } from './constants';
import { generateProductDescription } from './services/geminiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const App: React.FC = () => {
  // --- State Management ---
  const [products, setProducts] = useState<Product[]>(() => {
    // Clear old cached products to ensure fresh data
    localStorage.removeItem('ll_products');
    return INITIAL_PRODUCTS;
  });
  
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('ll_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('ll_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('ll_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ll_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [addresses, setAddresses] = useState<Address[]>(() => {
    const saved = localStorage.getItem('ll_addresses');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Primary Residence', fullName: 'Alex Sterling', phone: '+1 234 567 890', city: 'London', details: 'Baker Street 221B, Suite 4' }
    ];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('ll_orders');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [view, setView] = useState<View>('home');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [profileTab, setProfileTab] = useState<'info' | 'addresses' | 'orders'>('info');
  const [showPassword, setShowPassword] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Global Persistence Engine
  useEffect(() => {
    localStorage.setItem('ll_favorites', JSON.stringify(favorites));
    localStorage.setItem('ll_user', JSON.stringify(user));
    localStorage.setItem('ll_products', JSON.stringify(products));
    localStorage.setItem('ll_addresses', JSON.stringify(addresses));
    localStorage.setItem('ll_orders', JSON.stringify(orders));
    localStorage.setItem('ll_cart', JSON.stringify(cart));
    localStorage.setItem('ll_users', JSON.stringify(users));
  }, [favorites, user, products, addresses, orders, cart, users]);

  // View Transition Logic
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [view, selectedCategory]);

  // --- Handlers ---
  const handleAuth = (e: React.FormEvent<HTMLFormElement>, type: 'login' | 'register') => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    if (type === 'register') {
      if (users.find(u => u.email === email)) {
        alert("This identity record already exists in the registry.");
        return;
      }
      const newUser: User = { 
        id: Date.now().toString(), 
        email, 
        name, 
        isAdmin: false,
        phone: '' 
      };
      setUsers([...users, newUser]);
      setUser(newUser);
      setView('home');
    } else {
      const foundUser = users.find(u => u.email === email);
      if (foundUser) {
        setUser(foundUser);
        setView('home');
      } else {
        alert("Authentication failed. Identity not found.");
      }
    }
  };

  const updateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const updatedUser: User = {
      ...user,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
    };
    
    setUser(updatedUser);
    setUsers(users.map(u => u.id === user.id ? updatedUser : u));
    setIsEditingProfile(false);
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      return [...prev, { ...product, quantity }];
    });
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing && existing.quantity + delta <= 0) {
        return prev.filter(item => item.id !== id);
      }
      return prev.map(item => item.id === id ? { ...item, quantity: item.quantity + delta } : item);
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const finalizeOrder = () => {
    const newOrder: Order = {
      id: `LMN-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      items: [...cart],
      total: cartTotal,
      status: 'Processing'
    };
    setOrders([newOrder, ...orders]);
    setCart([]);
    setView('orders');
    setProfileTab('orders');
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      (selectedCategory === 'All' || p.category === selectedCategory) &&
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [products, selectedCategory, searchQuery]);

  const cartTotal = useMemo(() => cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0), [cart]);

  // --- Components ---

  const Navbar = () => (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="glass py-3 md:py-4 flex items-center justify-between shadow-2xl w-full px-3 md:px-6">
        <div className="flex items-center gap-3 md:gap-8">
          <h1 className="text-lg md:text-2xl font-black tracking-tighter cursor-pointer flex items-center gap-2" onClick={() => setView('home')}>
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 shadow-lg shadow-purple-500/20" />
            <span className="hidden sm:inline">LUMINA<span className="text-purple-500">LUXE</span></span>
            <span className="sm:hidden text-base">LUX</span>
          </h1>
          <div className="hidden lg:flex relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs md:text-sm w-[16rem] lg:w-[24rem] focus:outline-none focus:border-purple-500 transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2 lg:gap-4">
          <button onClick={() => setView('favorites')} className="p-1.5 md:p-2 relative hover:bg-white/5 rounded-full transition group">
            <Heart className={`w-4 h-4 md:w-5 md:h-5 transition-all duration-300 ${favorites.length > 0 ? 'fill-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-white/40 group-hover:text-white'}`} />
            {favorites.length > 0 && <span className="absolute top-0 right-0 w-3 h-3 md:w-4 md:h-4 bg-red-500 text-[6px] md:text-[8px] font-black flex items-center justify-center rounded-full ring-2 ring-black">{favorites.length}</span>}
          </button>
          
          <button onClick={() => setView('cart')} className="p-1.5 md:p-2 relative hover:bg-white/5 rounded-full transition group">
            <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-white/40 group-hover:text-white" />
            {cart.length > 0 && <span className="absolute top-0 right-0 w-3 h-3 md:w-4 md:h-4 bg-purple-600 text-[6px] md:text-[8px] font-black flex items-center justify-center rounded-full ring-2 ring-black">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
          </button>

          {user ? (
            <div className="flex items-center gap-1 md:gap-2">
              <button onClick={() => { setView('profile'); setProfileTab('info'); }} className="flex items-center gap-2 md:gap-3 glass px-2 md:px-4 py-1.5 md:py-2 rounded-full hover:bg-white/10 transition">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[8px] md:text-[10px] font-bold">{user.name[0]}</div>
                <span className="hidden sm:inline text-[10px] md:text-xs font-bold tracking-tight">{user.name.split(' ')[0]}</span>
              </button>
              <button onClick={() => { setUser(null); setView('home'); }} className="p-1.5 md:p-2 hover:bg-red-500/10 text-white/20 hover:text-red-500 rounded-full transition" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => setView('login')} className="bg-white text-black px-3 md:px-6 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-white/90 transition shadow-xl">Sign In</button>
          )}
        </div>
      </div>
      
      {view === 'shop' && (
      <div className="glass border-t border-white/5 px-0 py-1 md:py-2 overflow-x-auto flex gap-3 md:gap-6 lg:gap-10 justify-center no-scrollbar backdrop-blur-3xl w-full">
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => { setSelectedCategory(cat); setView('shop'); }}
              className={`text-[8px] md:text-[10px] uppercase font-black tracking-wider md:tracking-widest transition-all whitespace-nowrap px-1.5 md:px-2 py-1 relative ${selectedCategory === cat ? 'text-purple-400' : 'text-white/40 hover:text-white'}`}
            >
              {cat}
              {selectedCategory === cat && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-purple-600 rounded-full" />}
            </button>
          ))}
        </div>
      )}
    </nav>
  );

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const cartItem = cart.find(item => item.id === product.id);
    const inCart = !!cartItem;
    const [localQty, setLocalQty] = useState(1);
    const quantity = inCart ? cartItem.quantity : localQty;
    const isFav = favorites.includes(product.id);

    const handleIncrement = () => {
      if (inCart) {
        updateCartQuantity(product.id, 1);
      } else {
        setLocalQty(prev => prev + 1);
      }
    };

    const handleDecrement = () => {
      if (inCart) {
        updateCartQuantity(product.id, -1);
      } else {
        setLocalQty(prev => Math.max(1, prev - 1));
      }
    };

    return (
      <div className="group relative glass rounded-[2rem] overflow-hidden hover:border-purple-500/40 transition-all duration-700 hover:-translate-y-1.5 flex flex-col h-full ring-1 ring-white/5">
        <button 
          onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
          className={`absolute top-4 right-4 z-20 p-2.5 rounded-full transition-all duration-300 transform shadow-xl ${isFav ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] scale-110' : 'bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/20'}`}
        >
          <Heart className={`w-3.5 h-3.5 transition-colors ${isFav ? 'fill-white text-white' : 'text-white'}`} />
        </button>

        <div className="aspect-[4/5] overflow-hidden bg-white/5 cursor-pointer" onClick={() => { setView('shop'); setSelectedCategory(product.category); }}>
          <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition duration-1000" />
        </div>

        <div className="p-5 flex flex-col flex-grow bg-gradient-to-b from-transparent to-black/60">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-purple-400 mb-0.5 block">{product.category}</span>
              <h3 className="font-bold text-sm mb-1 leading-tight line-clamp-1">{product.name}</h3>
            </div>
            <span className="text-sm font-black tracking-tighter text-white">${product.price}</span>
          </div>
          
          <p className="text-[10px] text-white/40 line-clamp-2 mb-4 leading-relaxed flex-grow">{product.description}</p>
          
          <div className="flex items-center gap-2">
            <div className={`flex items-center glass rounded-lg border border-white/5 overflow-hidden transition-all ${inCart ? 'bg-purple-600/10 border-purple-500/30' : ''}`}>
              <button onClick={handleDecrement} className="px-1.5 py-1.5 hover:bg-white/5 text-white/40 hover:text-white transition">
                {inCart && quantity === 1 ? <Trash2 className="w-3 h-3 text-red-500" /> : <Minus className="w-3 h-3" />}
              </button>
              <span className={`w-4 text-center text-[10px] font-black ${inCart ? 'text-purple-400' : ''}`}>{quantity}</span>
              <button onClick={handleIncrement} className="px-1.5 py-1.5 hover:bg-white/5 text-white/40 hover:text-white transition">
                <Plus className="w-3 h-3" />
              </button>
            </div>
            
            <button 
              onClick={() => {
                if (!inCart) {
                  addToCart(product, localQty);
                  setLocalQty(1);
                } else {
                  setView('cart');
                }
              }}
              className={`flex-grow py-2 rounded-lg font-black uppercase text-[9px] tracking-widest transition active:scale-95 shadow-lg flex items-center justify-center gap-1.5 ${inCart ? 'bg-purple-600 text-white hover:bg-purple-500' : 'bg-white text-black hover:bg-purple-600 hover:text-white'}`}
            >
              {inCart ? 'In Selection' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ManifestoView = () => (
    <div className="pt-32 px-6 max-w-4xl mx-auto min-h-screen pb-32">
      <div className="flex flex-col items-center text-center mb-20">
        <ScrollText className="w-12 h-12 text-purple-500 mb-6 animate-pulse" />
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6 leading-none">THE OBSIDIAN <br /> <span className="gradient-text">MANIFESTO</span></h2>
        <div className="h-1 w-32 bg-purple-600 rounded-full mb-10 shadow-[0_0_25px_rgba(168,85,247,0.5)]" />
      </div>

      <div className="space-y-16 text-white/60 text-lg md:text-2xl leading-relaxed font-medium text-justify">
        <section className="space-y-6 glass p-10 md:p-14 rounded-[3.5rem] border border-white/10 hover:border-purple-500/30 transition-all duration-700">
          <div className="flex items-center gap-4 text-purple-400 mb-2">
             <Binary className="w-6 h-6" />
             <span className="text-[11px] font-black uppercase tracking-[0.5em]">Vision 0.1</span>
          </div>
          <p>
            Commerce is no longer just a transaction; it is a synchronization of intent. In the age of 
            infinite choice, the true luxury is <span className="text-white font-black">curation</span>. 
            Lumina Luxe exists at the intersection of orbital logistics and high-fidelity design. 
            We do not just sell objects; we verify artifacts.
          </p>
        </section>

        <section className="space-y-6 glass p-10 md:p-14 rounded-[3.5rem] border border-white/10 hover:border-blue-500/30 transition-all duration-700">
           <div className="flex items-center gap-4 text-blue-400 mb-2">
             <Cpu className="w-6 h-6" />
             <span className="text-[11px] font-black uppercase tracking-[0.5em]">Vision 0.2</span>
          </div>
          <p>
            Every product in the Obsidian Archive has been scrutinized for its <span className="text-white font-bold">neural impact</span>. 
            We believe that the tools of the future should feel like extensions of the self. 
            From aerospace-grade titanium to holographic displays, we bridge the gap between 
            the dream and the delivery.
          </p>
        </section>
      </div>

      <div className="mt-20 flex flex-col items-center">
         <button onClick={() => setView('shop')} className="bg-white text-black px-12 py-6 rounded-full font-black uppercase text-[10px] tracking-[0.3em] shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:scale-105 transition-all">Enter Repository</button>
      </div>
    </div>
  );

  const HomeView = () => (
    <div className="pt-24 animate-in fade-in duration-1000">
      <section className="px-6 py-6 overflow-x-auto flex gap-8 justify-start lg:justify-center no-scrollbar max-w-[1440px] mx-auto">
        {CATEGORIES.map(cat => (
          <button 
            key={cat}
            onClick={() => { setSelectedCategory(cat); setView('shop'); }}
            className="flex flex-col items-center gap-3 group"
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ring-2 ring-offset-2 ring-offset-black ${selectedCategory === cat ? 'ring-purple-600' : 'ring-white/5 group-hover:ring-purple-400/50'}`}>
              <div className="w-[72px] h-[72px] rounded-full overflow-hidden bg-white/5">
                <img src={CATEGORY_IMAGES[cat]} className="w-full h-full object-cover group-hover:scale-125 transition duration-700" />
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">{cat}</span>
          </button>
        ))}
      </section>

      <section className="px-6 py-8 max-w-[1440px] mx-auto">
        <div className="relative glass rounded-[3.5rem] p-10 md:p-16 overflow-hidden group">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-600/10 to-transparent pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-6 bg-purple-600/10 border border-purple-500/20 w-fit px-4 py-1.5 rounded-full backdrop-blur-3xl">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-400">Exclusive Drop</span>
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none mb-8 uppercase">OBSIDIAN <br /> <span className="gradient-text">ARCHIVE 2025</span></h2>
            <p className="text-white/40 text-lg md:text-xl mb-10 leading-relaxed font-medium max-w-lg">Curated artifacts for the modern pioneer. Discover the intersection of luxury and frontier technology.</p>
            <div className="flex gap-4">
              <button onClick={() => setView('shop')} className="bg-white text-black px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl">Explore</button>
              <button onClick={() => setView('manifesto')} className="glass px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all border border-white/10">Manifesto</button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-10 max-w-[1440px] mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <Flame className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em]">Trending</span>
            </div>
            <h3 className="text-3xl font-black tracking-tighter uppercase">Hot Artifacts</h3>
          </div>
          <button onClick={() => setView('shop')} className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition flex items-center gap-2">View All <ChevronRight className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
          {products.slice(4, 9).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <section className="px-4 md:px-6 lg:px-10 py-8 md:py-12 max-w-[1440px] mx-auto bg-white/2 rounded-2xl md:rounded-[4rem] border border-white/5 my-8 md:my-12">
        <div className="flex flex-col items-center text-center mb-8 md:mb-16">
          <div className="bg-blue-600/10 text-blue-400 p-3 md:p-4 rounded-lg md:rounded-[1.5rem] mb-4 md:mb-6 ring-1 ring-blue-500/20">
            <TrendingUp className="w-6 md:w-8 h-6 md:h-8" />
          </div>
          <h3 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tighter uppercase mb-3 md:mb-4">Latest Registry</h3>
          <p className="text-white/30 max-w-xl text-lg leading-relaxed">Our database expands with fresh technological marvels daily. Synchronize your environment now.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
          {products.slice(0, 5).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
        <div className="mt-8 md:mt-16 text-center">
          <button onClick={() => setView('shop')} className="glass px-6 md:px-14 py-3 md:py-6 rounded-full font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:bg-white/5 transition-all ring-1 ring-white/10">Full Repository</button>
        </div>
      </section>
    </div>
  );

  const AuthView = ({ type }: { type: 'login' | 'register' }) => (
    <div className="pt-32 pb-32 px-6 flex items-center justify-center min-h-[90vh]">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 glass rounded-[3.5rem] overflow-hidden shadow-2xl border border-white/5 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] -z-10" />
        <div className="hidden lg:flex bg-gradient-to-br from-purple-900/40 to-blue-900/40 p-16 flex-col justify-between border-r border-white/5">
          <div className="space-y-4">
             <div className="w-12 h-12 rounded-[1.2rem] bg-white/5 flex items-center justify-center ring-1 ring-white/10 mb-8"><ShieldCheck className="w-6 h-6 text-purple-400" /></div>
             <h2 className="text-5xl font-black tracking-tighter leading-none uppercase">{type === 'login' ? 'Welcome Back' : 'Join Registry'}</h2>
             <p className="text-white/40 text-lg font-medium leading-relaxed">Secure access to the world's most curated high-tech archive.</p>
          </div>
          <div className="flex gap-4 items-center opacity-40">
            <Globe className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Global Network</span>
          </div>
        </div>

        <div className="p-12 md:p-16 flex flex-col justify-center">
          <form className="space-y-6" onSubmit={(e) => handleAuth(e, type)}>
            {type === 'register' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-4">Identity Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input required name="name" type="text" placeholder="Full Name" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-sm focus:border-purple-500 transition focus:outline-none placeholder:text-white/10 font-bold" />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-4">Email</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input required name="email" type="email" placeholder="Verification Email" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-sm focus:border-purple-500 transition focus:outline-none placeholder:text-white/10 font-bold" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-4">Registry Key</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input required name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 pr-12 text-sm focus:border-purple-500 transition focus:outline-none placeholder:text-white/10 font-bold" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button className="w-full py-5 bg-white text-black rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition shadow-2xl mt-4">
              {type === 'login' ? 'Authenticate' : 'Establish Record'}
            </button>
          </form>
          <div className="mt-8 text-center">
             <button onClick={() => setView(type === 'login' ? 'register' : 'login')} className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-purple-400 transition">
               {type === 'login' ? "Create one" : "Verify here"}
             </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ProfileView = () => (
    <div className="pt-20 md:pt-32 px-4 md:px-6 max-w-[1440px] mx-auto min-h-screen pb-20">
      <div className="flex flex-col lg:flex-row gap-6 md:gap-12">
        <div className="w-full lg:w-80 space-y-2">
          <div className="glass p-6 md:p-8 rounded-2xl md:rounded-[3rem] text-center relative overflow-hidden group mb-6 md:mb-8">
             <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition duration-1000" />
             <div className="w-20 md:w-24 h-20 md:h-24 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 mx-auto mb-3 md:mb-4 flex items-center justify-center text-2xl md:text-3xl font-black shadow-2xl relative z-10">
               {user?.name[0]}
             </div>
             <h3 className="font-black text-xl mb-1 relative z-10">{user?.name}</h3>
             <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] relative z-10">{user?.email}</p>
          </div>
          
          {[
            { id: 'info', icon: UserIcon, label: 'Identity Information' },
            { id: 'addresses', icon: MapPin, label: 'Transit Locations' },
            { id: 'orders', icon: Package, label: 'Archive History' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setProfileTab(tab.id as any)}
              className={`w-full flex items-center gap-2 md:gap-4 px-3 md:px-6 py-3 md:py-4 rounded-lg md:rounded-[1.8rem] transition-all relative text-[11px] md:text-xs ${profileTab === tab.id ? 'bg-purple-600 shadow-xl shadow-purple-900/30' : 'glass hover:bg-white/5'}`}
            >
              <tab.icon className="w-4 h-4 flex-shrink-0" />
              <span className="font-black uppercase tracking-tight md:tracking-widest hidden sm:inline">{tab.label}</span>
              {profileTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0" />}
            </button>
          ))}
          
          <button onClick={() => { setUser(null); setView('home'); }} className="w-full flex items-center gap-2 md:gap-4 px-3 md:px-6 py-3 md:py-4 rounded-lg md:rounded-[1.8rem] text-red-500 glass hover:bg-red-500/10 transition mt-6 md:mt-10 text-[11px] md:text-xs\">
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className="font-black uppercase tracking-tight md:tracking-widest hidden sm:inline\">Terminate Session</span>
          </button>
        </div>

        <div className="flex-grow glass p-6 md:p-10 lg:p-14 rounded-xl md:rounded-2xl lg:rounded-[4rem] min-h-[400px] md:min-h-[500px] border border-white/5">
          {profileTab === 'info' && (
            <div className="space-y-6 md:space-y-12 animate-in slide-in-from-right duration-500">
               <div className="flex justify-between items-center">
                 <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase">IDENTITY</h2>
                 <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="glass p-3 rounded-[1.2rem] hover:bg-white/5 transition">
                   {isEditingProfile ? <X className="w-5 h-5 text-red-400" /> : <Edit3 className="w-5 h-5 text-purple-400" />}
                 </button>
               </div>

               {isEditingProfile ? (
                 <form onSubmit={updateProfile} className="space-y-8 animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-4">Identity Name</label>
                          <input required name="name" defaultValue={user?.name} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-medium focus:border-purple-500 outline-none" />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-4">Verification Email</label>
                          <input required name="email" defaultValue={user?.email} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-medium focus:border-purple-500 outline-none" />
                       </div>
                    </div>
                    <button type="submit" className="bg-purple-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl">
                      <Save className="w-4 h-4" /> Synchronize Records
                    </button>
                 </form>
               ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-4">Full Name</label>
                      <div className="p-5 glass rounded-2xl border border-white/5 text-sm font-medium">{user?.name}</div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-4">Verified Email</label>
                      <div className="p-5 glass rounded-2xl border border-white/5 text-sm font-medium">{user?.email}</div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-4">Collector Status</label>
                      <div className="p-5 glass rounded-2xl border border-white/5 text-sm font-black text-purple-400 uppercase tracking-widest">Elite Tier</div>
                    </div>
                </div>
               )}
            </div>
          )}

          {profileTab === 'addresses' && (
            <div className="space-y-12 animate-in slide-in-from-right duration-500">
              <div className="flex justify-between items-center">
                <h2 className="text-4xl font-black tracking-tighter uppercase">LOCATIONS</h2>
                <button onClick={() => setShowAddressModal(true)} className="bg-white text-black px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition shadow-xl">New Entry</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map(addr => (
                  <div key={addr.id} className="glass p-8 rounded-[2.5rem] border border-white/5 hover:border-purple-500/20 transition group">
                    <div className="flex justify-between items-start mb-6">
                      <span className="bg-purple-600/10 text-purple-400 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-purple-500/10">{addr.title}</span>
                      <div className="flex gap-2">
                         <button className="text-white/20 hover:text-white transition"><Edit3 className="w-4 h-4"/></button>
                         <button onClick={() => setAddresses(addresses.filter(a => a.id !== addr.id))} className="text-white/20 hover:text-red-500 transition"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    </div>
                    <p className="font-black text-lg mb-2">{addr.fullName}</p>
                    <p className="text-white/40 text-xs mb-1 font-medium">{addr.phone}</p>
                    <p className="text-white/60 text-sm leading-relaxed font-medium">{addr.details}, {addr.city}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {profileTab === 'orders' && (
            <div className="space-y-12 animate-in slide-in-from-right duration-500">
               <h2 className="text-4xl font-black tracking-tighter uppercase">ARCHIVE</h2>
               {orders.length === 0 ? (
                 <div className="text-center py-24 opacity-20">
                   <Package className="w-20 h-20 mx-auto mb-6" />
                   <p className="text-sm font-black uppercase tracking-[0.3em]">Registry is empty</p>
                 </div>
               ) : (
                 <div className="space-y-6">
                   {orders.map(order => (
                     <div key={order.id} className="glass p-8 rounded-[3rem] border border-white/5 hover:bg-white/5 transition duration-500">
                        <div className="flex justify-between items-start mb-8">
                          <div>
                            <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">{order.id}</p>
                            <p className="text-sm font-bold text-white/40">{order.date}</p>
                          </div>
                          <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-500/20">
                            <CheckCircle className="w-3 h-3" /> {order.status}
                          </div>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar">
                           {order.items.map(item => (
                             <div key={item.id} className="flex-shrink-0 group relative">
                               <img src={item.image} className="w-20 h-20 rounded-2xl object-cover border border-white/5 transition-transform group-hover:scale-105" />
                               <span className="absolute -top-2 -right-2 w-6 h-6 bg-white text-black text-[9px] font-black flex items-center justify-center rounded-full ring-4 ring-black">{item.quantity}</span>
                             </div>
                           ))}
                        </div>
                        <div className="flex justify-between items-end mt-4 pt-6 border-t border-white/5">
                           <div>
                              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Valuation</p>
                              <span className="text-3xl font-black tracking-tighter text-white">${order.total}</span>
                           </div>
                           <button className="text-[10px] font-black uppercase tracking-widest text-purple-400 hover:text-white transition">Full Manifest</button>
                        </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const CheckoutView = () => {
    const [step, setStep] = useState(1);
    const [selectedAddrId, setSelectedAddrId] = useState(addresses[0]?.id);

    return (
      <div className="pt-20 md:pt-32 px-4 md:px-6 max-w-[1440px] mx-auto min-h-screen pb-20 md:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-16">
          <div className="lg:col-span-2 space-y-6 md:space-y-12">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase">SECURE TRANSFER</h2>
            
            <div className="flex gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 flex-grow rounded-full transition-all duration-700 ${step >= i ? 'bg-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-white/5'}`} />
              ))}
            </div>

            {step === 1 && (
              <div className="glass p-12 rounded-[4rem] space-y-10 animate-in slide-in-from-right duration-500">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-4"><MapPin className="text-purple-400" /> Transit Node</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-5">
                   {addresses.map(addr => (
                     <div 
                      key={addr.id}
                      onClick={() => setSelectedAddrId(addr.id)}
                      className={`p-8 rounded-[2.5rem] cursor-pointer transition-all border-2 flex flex-col h-full ${selectedAddrId === addr.id ? 'border-purple-600 bg-purple-600/10' : 'border-white/5 glass hover:bg-white/10'}`}
                     >
                        <div className="flex justify-between mb-6">
                           <span className="text-[9px] font-black uppercase tracking-widest text-white/30">{addr.title}</span>
                           {selectedAddrId === addr.id && <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center"><CheckCircle className="w-3.5 h-3.5" /></div>}
                        </div>
                        <p className="font-black text-lg mb-1 leading-none">{addr.fullName}</p>
                        <p className="text-white/40 text-xs mb-4">{addr.phone}</p>
                        <p className="text-white/60 text-xs mt-auto line-clamp-2">{addr.details}</p>
                     </div>
                   ))}
                   <button onClick={() => setShowAddressModal(true)} className="p-8 rounded-[2.5rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 hover:bg-white/5 transition group">
                      <div className="p-4 rounded-full bg-white/5 group-hover:bg-purple-600/20 transition-colors"><Plus className="w-6 h-6 text-white/20 group-hover:text-purple-400" /></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Add Node</span>
                   </button>
                </div>
                <button onClick={() => setStep(2)} className="w-full py-6 bg-white text-black rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition shadow-2xl">Confirm Logistics</button>
              </div>
            )}

            {step === 2 && (
              <div className="glass p-12 rounded-[4rem] space-y-10 animate-in slide-in-from-right duration-500">
                 <h3 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-4"><CreditCard className="text-purple-400" /> Credit Interface</h3>
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-4">Authorized Signature</label>
                       <input type="text" placeholder="ALEX STERLING" className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-5 text-sm font-bold focus:border-purple-500 transition focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-4">Card Interface</label>
                       <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-5 text-sm font-mono tracking-[0.2em] focus:border-purple-500 transition focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:gap-5">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-4">Temporal Limit</label>
                          <input type="text" placeholder="MM/YY" className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-5 text-sm font-bold focus:border-purple-500 transition focus:outline-none" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-4">Verification Code</label>
                          <input type="password" placeholder="•••" className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-5 text-sm font-bold focus:border-purple-500 transition focus:outline-none" />
                       </div>
                    </div>
                 </div>
                 <div className="flex gap-5">
                    <button onClick={() => setStep(1)} className="flex-grow py-6 glass rounded-3xl font-black text-xs uppercase tracking-widest">Revert</button>
                    <button onClick={finalizeOrder} className="flex-[2] py-6 bg-purple-600 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-purple-900/40 hover:scale-[1.02] transition">Authorize Synchronization</button>
                 </div>
              </div>
            )}
          </div>

          {/* Checkout Summary */}
          <div className="space-y-8">
            <div className="glass p-10 rounded-[3.5rem] sticky top-48 border border-white/5">
               <h3 className="text-[10px] font-black tracking-[0.4em] text-white/20 uppercase mb-10">Manifest Summary</h3>
               <div className="space-y-6 mb-10 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-5 items-center">
                       <img src={item.image} className="w-16 h-16 rounded-[1.2rem] object-cover ring-1 ring-white/10" />
                       <div className="flex-grow">
                          <p className="font-black text-xs truncate w-32 uppercase tracking-tight">{item.name}</p>
                          <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">Units: {item.quantity}</p>
                       </div>
                       <span className="font-black text-sm text-purple-400">${item.price * item.quantity}</span>
                    </div>
                  ))}
               </div>
               <div className="pt-8 border-t border-white/10 space-y-4">
                  <div className="flex justify-between text-xs font-bold text-white/40 uppercase"><span>Subtotal</span><span>${cartTotal}</span></div>
                  <div className="flex justify-between text-3xl font-black tracking-tighter pt-4 text-white"><span>TOTAL</span><span>${cartTotal}</span></div>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CartView = () => (
    <div className="pt-20 md:pt-32 px-4 md:px-6 max-w-[1440px] mx-auto min-h-screen pb-20 md:pb-32">
      <h2 className="text-3xl md:text-6xl lg:text-8xl font-black tracking-tighter uppercase mb-12 md:mb-20 text-center">SELECTION</h2>
      {cart.length === 0 ? (
        <div className="glass p-8 md:p-24 rounded-2xl md:rounded-[4rem] text-center max-w-4xl mx-auto">
          <ShoppingBag className="w-16 md:w-24 h-16 md:h-24 mx-auto text-white/5 mb-6 md:mb-8" />
          <h3 className="text-2xl md:text-3xl font-black tracking-tighter mb-4 md:mb-6 uppercase">Registry is vacant</h3>
          <button onClick={() => setView('shop')} className="bg-white text-black px-6 md:px-12 py-3 md:py-5 rounded-full font-black uppercase text-[10px] md:text-xs tracking-widest hover:scale-110 transition shadow-2xl">Start Archive</button>
        </div>
      ) : (
        <div className="space-y-8">
          {cart.map(item => (
            <div key={item.id} className="glass p-8 rounded-[4rem] flex items-center justify-between group transition-all duration-500 hover:bg-white/5 border border-white/5">
              <div className="flex items-center gap-10">
                <img src={item.image} className="w-32 h-32 rounded-[2.5rem] object-cover border-2 border-white/5 group-hover:scale-105 transition duration-1000" />
                <div>
                  <h4 className="font-black text-3xl mb-1 uppercase tracking-tight">{item.name}</h4>
                  <p className="text-[10px] text-purple-400 font-black uppercase tracking-[0.3em] mb-6">{item.category}</p>
                  <div className="flex items-center glass rounded-2xl overflow-hidden w-fit border border-white/5 p-1.5">
                     <button onClick={() => updateCartQuantity(item.id, -1)} className="p-3 hover:bg-white/10 text-white/40 hover:text-white transition"><Minus className="w-5 h-5"/></button>
                     <span className="w-12 text-center text-lg font-black">{item.quantity}</span>
                     <button onClick={() => updateCartQuantity(item.id, 1)} className="p-3 hover:bg-white/10 text-white/40 hover:text-white transition"><Plus className="w-5 h-5"/></button>
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-8 pr-6">
                <span className="text-5xl font-black tracking-tighter text-white">${item.price * item.quantity}</span>
                <button onClick={() => removeFromCart(item.id)} className="p-4 text-white/10 hover:text-red-500 glass rounded-[1.8rem] transition shadow-inner">
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))}
          <div className="mt-12 md:mt-24 pt-8 md:pt-16 border-t border-white/10 flex flex-col md:flex-row justify-center md:justify-between items-center gap-4 md:gap-12 px-0 md:px-6">
            <div className="text-center md:text-left">
              <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.4em] mb-2">Registry Valuation</p>
              <h3 className="text-7xl md:text-8xl font-black tracking-tighter text-white">${cartTotal}</h3>
            </div>
            <button 
              onClick={() => {
                if(!user) setView('login');
                else setView('checkout');
              }}
              className="w-full md:w-auto px-16 py-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-[3rem] font-black uppercase text-xs tracking-[0.3em] shadow-[0_0_50px_rgba(168,85,247,0.3)] hover:scale-105 active:scale-95 transition"
            >
              Authorize Transaction
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-purple-600 selection:text-white">
      <Navbar />
      
      <main className="animate-in fade-in duration-1000 min-h-screen">
        {view === 'home' && <HomeView />}
        {view === 'manifesto' && <ManifestoView />}
        {view === 'shop' && (
          <section className="pt-52 px-6 pb-32 max-w-[1440px] mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-20 gap-10">
              <div>
                <h2 className="text-6xl font-black tracking-tighter uppercase mb-3">{selectedCategory}</h2>
                <div className="flex items-center gap-4">
                   <div className="h-1.5 w-20 bg-purple-600 rounded-full" />
                   <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-black">{filteredProducts.length} Registry Entries</p>
                </div>
              </div>
              <div className="glass flex items-center px-8 py-4 rounded-[2.5rem] w-full lg:w-[450px] ring-1 ring-white/10 group focus-within:ring-purple-500/50 transition duration-500">
                <Search className="w-5 h-5 text-white/20 mr-5 group-focus-within:text-purple-400 transition" />
                <input 
                  type="text" 
                  placeholder="Filter records..." 
                  className="bg-transparent text-base w-full focus:outline-none placeholder:text-white/10 font-bold"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
        {(view === 'login' || view === 'register') && <AuthView type={view} />}
        {view === 'favorites' && (
          <section className="pt-32 px-6 pb-40 max-w-[1440px] mx-auto min-h-screen">
            <div className="flex justify-between items-end mb-20 px-6">
               <div>
                  <h2 className="text-6xl font-black tracking-tighter uppercase mb-4">THE VAULT</h2>
                  <div className="h-1.5 w-40 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
               </div>
               <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-black">{favorites.length} Artifacts Sealed</p>
            </div>
            {favorites.length === 0 ? (
               <div className="glass p-32 rounded-[4rem] text-center border border-dashed border-white/10 max-w-4xl mx-auto">
                 <Heart className="w-24 h-24 mx-auto text-white/5 mb-8" />
                 <h3 className="text-3xl font-black tracking-tighter uppercase mb-8">Vault is vacant</h3>
                 <button onClick={() => setView('shop')} className="bg-white text-black px-12 py-5 rounded-full font-black uppercase text-xs tracking-widest hover:scale-110 transition">Fill Vault</button>
               </div>
            ) : (
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                 {products.filter(p => favorites.includes(p.id)).map(p => <ProductCard key={p.id} product={p} />)}
               </div>
            )}
          </section>
        )}
        {view === 'profile' && <ProfileView />}
        {view === 'orders' && <ProfileView />}
        {view === 'cart' && <CartView />}
        {view === 'checkout' && <CheckoutView />}
      </main>

      <footer className="glass mt-12 md:mt-24 py-8 md:py-16 lg:py-20 px-4 md:px-8 lg:px-10 border-t-0 border-white/5 relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 lg:gap-24 relative z-10">
          <div className="sm:col-span-2 lg:col-span-2">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 md:mb-8">LUMINA<span className="text-purple-500">LUXE</span></h2>
            <p className="text-white/40 mb-6 md:mb-16 text-sm md:text-base lg:text-xl leading-relaxed font-medium">Redefining high-fidelity commerce. Every artifact curated is a testament to the future.</p>
            <div className="flex gap-2 md:gap-4 w-full md:max-w-md">
               <input placeholder="Establish Link" className="bg-white/5 border border-white/10 rounded-full md:rounded-[1.8rem] px-4 md:px-8 py-2 md:py-5 flex-grow text-sm md:text-base focus:outline-none focus:border-purple-500 transition font-bold" />
               <button className="bg-white text-black px-4 md:px-10 rounded-full md:rounded-[1.8rem] font-black uppercase text-[9px] md:text-[10px] tracking-widest transition hover:scale-105 active:scale-95 shadow-xl whitespace-nowrap">Join</button>
            </div>
          </div>
          <div>
            <h4 className="font-black text-[9px] md:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.5em] text-white/20 mb-4 md:mb-10">Nexus</h4>
            <ul className="space-y-3 md:space-y-5 text-xs md:text-sm text-white/40 font-black uppercase tracking-wider md:tracking-widest">
              <li onClick={() => setView('shop')} className="hover:text-purple-400 cursor-pointer transition">Marketplace</li>
              <li onClick={() => setView('favorites')} className="hover:text-purple-400 cursor-pointer transition">Vault</li>
              <li className="hover:text-purple-400 cursor-pointer transition">Elite Drops</li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-[9px] md:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.5em] text-white/20 mb-4 md:mb-10">Legal</h4>
            <ul className="space-y-3 md:space-y-5 text-xs md:text-sm text-white/40 font-black uppercase tracking-wider md:tracking-widest">
              <li onClick={() => setView('manifesto')} className="hover:text-purple-400 cursor-pointer transition">Protocol</li>
              <li className="hover:text-purple-400 cursor-pointer transition">Identity Policy</li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto mt-8 md:mt-20 pt-6 md:pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between text-[8px] md:text-[10px] text-white/10 font-black tracking-[0.2em] md:tracking-[0.4em] uppercase">
          <p>© 2025 LUMINA LUXE ARTIFACTS. SECURE ACCESS DECRYPTED.</p>
          <div className="flex gap-6 md:gap-12 mt-4 md:mt-0">
             <span className="hover:text-white cursor-pointer transition">NETWORK</span>
             <span className="hover:text-white cursor-pointer transition">SATELLITE</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
