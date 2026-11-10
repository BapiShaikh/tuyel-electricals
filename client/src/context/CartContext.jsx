import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext({});

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tuyel_cart')) || [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('tuyel_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock_quantity || 99) }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.selling_price,
        image: product.primary_image || product.images?.[0]?.image_path,
        brand: product.brand_name,
        stock: product.stock_quantity,
        quantity,
      }];
    });
  };

  const removeFromCart = (productId) => setCart(prev => prev.filter(item => item.id !== productId));

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setCart(prev => prev.map(item =>
      item.id === productId ? { ...item, quantity: Math.min(quantity, item.stock || 99) } : item
    ));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

