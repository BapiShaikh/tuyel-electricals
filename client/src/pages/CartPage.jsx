import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { orderAPI } from '../services/api';
import { formatCurrency, getImageUrl, PAYMENT_METHODS } from '../utils/helpers';
import PublicLayout from '../layouts/PublicLayout';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [form, setForm] = useState({
    customer_name: '', customer_phone: '', address: '', village: '', pin_code: '',
    order_notes: '', payment_method: 'cash_at_shop'
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.customer_name.trim()) errs.customer_name = 'Name is required';
    if (!form.customer_phone.match(/^[6-9]\d{9}$/)) errs.customer_phone = 'Enter valid 10-digit mobile';
    if (!form.address.trim()) errs.address = 'Address is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const orderData = {
        ...form,
        items: cart.map(item => ({ product_id: item.id, quantity: item.quantity }))
      };
      const { data } = await orderAPI.create(orderData);
      if (data.success) {
        clearCart();
        setOrderSuccess(data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <PublicLayout>
        <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
          <div className="max-w-lg w-full text-center card p-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="font-display font-bold text-2xl text-navy-900 mb-2">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-6">Thank you for your order. We'll contact you shortly for confirmation.</p>
            <div className="bg-green-50 rounded-xl p-4 mb-6">
              <div className="text-sm text-gray-600">Order ID</div>
              <div className="font-mono font-bold text-2xl text-navy-900">{orderSuccess.order_id}</div>
            </div>
            <div className="flex flex-col gap-3">
              <a
                href={`https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(`Hi! I just placed Order #${orderSuccess.order_id} for ₹${orderSuccess.total_amount}. Please confirm.`)}`}
                target="_blank" rel="noopener noreferrer"
                className="btn-primary bg-green-500 hover:bg-green-600 justify-center"
              >
                <MessageCircle size={18} /> Confirm on WhatsApp
              </a>
              <Link to="/shop" className="btn-outline justify-center">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (cart.length === 0) {
    return (
      <PublicLayout>
        <div className="min-h-[60vh] flex items-center justify-center py-12">
          <div className="text-center">
            <ShoppingCart size={80} className="text-gray-200 mx-auto mb-6" />
            <h2 className="font-display font-bold text-2xl text-gray-700 mb-3">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add some electrical products to get started</p>
            <Link to="/shop" className="btn-primary">Start Shopping</Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-gray-50 py-10 min-h-screen">
        <div className="container mx-auto px-4">
          <h1 className="font-display font-bold text-3xl text-navy-900 mb-8">Shopping Cart ({cart.length} items)</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map(item => (
                <div key={item.id} className="card flex gap-4 p-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                    <img
                      src={getImageUrl(item.image, item.name)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-navy-900 text-sm line-clamp-2">{item.name}</h3>
                    {item.brand && <div className="text-xs text-electric-600 mt-0.5">{item.brand}</div>}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1.5 hover:bg-gray-50"><Minus size={14} /></button>
                        <span className="px-3 py-1.5 font-semibold text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1.5 hover:bg-gray-50"><Plus size={14} /></button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-navy-900">{formatCurrency(item.price * item.quantity)}</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary / Checkout */}
            <div>
              <div className="card p-6 sticky top-24">
                <h2 className="font-display font-bold text-lg text-navy-900 mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate mr-2">{item.name} ×{item.quantity}</span>
                      <span className="font-medium shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-700">Total</span>
                    <span className="font-bold text-xl text-navy-900">{formatCurrency(cartTotal)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">* Final price confirmed by shop owner</p>
                </div>

                {!showCheckout ? (
                  <div className="space-y-3">
                    <button onClick={() => setShowCheckout(true)} className="btn-primary w-full justify-center py-3">
                      Proceed to Checkout <ArrowRight size={16} />
                    </button>
                    <a
                      href={`https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(`Hi! I want to order:\n${cart.map(i => `• ${i.name} ×${i.quantity} = ₹${i.price * i.quantity}`).join('\n')}\n\nTotal: ₹${cartTotal}`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="btn-primary bg-green-500 hover:bg-green-600 w-full justify-center py-3"
                    >
                      <MessageCircle size={16} /> Order via WhatsApp
                    </a>
                  </div>
                ) : (
                  <form onSubmit={handlePlaceOrder} className="space-y-3">
                    <h3 className="font-semibold text-gray-800">Delivery Details</h3>
                    {[
                      { name: 'customer_name', placeholder: 'Full Name *', type: 'text' },
                      { name: 'customer_phone', placeholder: 'Mobile Number *', type: 'tel' },
                      { name: 'address', placeholder: 'Full Address *', type: 'text' },
                      { name: 'village', placeholder: 'Village / Area', type: 'text' },
                      { name: 'pin_code', placeholder: 'PIN Code', type: 'text' },
                    ].map(f => (
                      <div key={f.name}>
                        <input {...f} value={form[f.name]} onChange={handleChange} className={`input-field py-2 text-sm ${errors[f.name] ? 'border-red-400' : ''}`} />
                        {errors[f.name] && <p className="text-red-500 text-xs mt-0.5">{errors[f.name]}</p>}
                      </div>
                    ))}
                    <div>
                      <label className="label text-xs">Payment Method</label>
                      <select name="payment_method" value={form.payment_method} onChange={handleChange} className="input-field py-2 text-sm">
                        {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.icon} {m.label}</option>)}
                      </select>
                    </div>
                    <textarea name="order_notes" value={form.order_notes} onChange={handleChange} placeholder="Order notes (optional)" className="input-field py-2 text-sm resize-none" rows={2} />
                    <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                      {loading ? 'Placing Order...' : `Place Order (${formatCurrency(cartTotal)})`}
                    </button>
                    <button type="button" onClick={() => setShowCheckout(false)} className="w-full text-sm text-gray-500 hover:text-gray-700">← Back to Cart</button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default CartPage;

