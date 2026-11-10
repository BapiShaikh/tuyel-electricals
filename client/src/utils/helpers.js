// Format currency in Indian Rupees
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

// Format datetime
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

// Category Fallback Image (Ultra high-res attractive photography)
export const getCategoryFallbackImage = (hint = '') => {
  const text = (hint || '').toLowerCase();
  if (text.includes('bulb') || text.includes('light') || text.includes('batten') || text.includes('led')) {
    return 'https://images.unsplash.com/photo-1550525811-e5869dd03032?w=800&q=80';
  }
  if (text.includes('fan') || text.includes('ceiling') || text.includes('exhaust')) {
    return 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80';
  }
  if (text.includes('wire') || text.includes('cable')) {
    return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80';
  }
  if (text.includes('switch') || text.includes('socket')) {
    return 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&q=80';
  }
  if (text.includes('mcb') || text.includes('breaker') || text.includes('board')) {
    return 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80';
  }
  if (text.includes('pump') || text.includes('motor') || text.includes('submersible')) {
    return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80';
  }
  if (text.includes('inverter') || text.includes('battery') || text.includes('ups')) {
    return 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80';
  }
  if (text.includes('refrigerator') || text.includes('fridge')) {
    return 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&q=80';
  }
  if (text.includes('stabilizer')) {
    return 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&q=80';
  }
  if (text.includes('service') || text.includes('repair') || text.includes('wiring')) {
    return 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80';
  }
  return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80';
};

// Get image URL
export const getImageUrl = (path, hint = '') => {
  if (!path) return getCategoryFallbackImage(hint);
  if (path.startsWith('http')) return path;
  const base = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
  return `${base}${path}`;
};

// Generate WhatsApp URL
export const getWhatsAppUrl = (phone, message) => {
  const cleanPhone = phone?.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

// Get booking status badge class
export const getBookingStatusBadge = (status) => {
  const map = {
    pending: 'badge-yellow',
    contacted: 'badge-blue',
    confirmed: 'badge-blue',
    assigned: 'badge-purple',
    on_the_way: 'badge-purple',
    in_progress: 'badge-blue',
    completed: 'badge-green',
    cancelled: 'badge-red',
  };
  return map[status] || 'badge-gray';
};

export const getBookingStatusLabel = (status) => {
  const map = {
    pending: 'Pending',
    contacted: 'Contacted',
    confirmed: 'Confirmed',
    assigned: 'Assigned',
    on_the_way: 'Technician On The Way',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return map[status] || status;
};

export const getOrderStatusBadge = (status) => {
  const map = {
    pending: 'badge-yellow',
    confirmed: 'badge-blue',
    processing: 'badge-purple',
    ready_for_pickup: 'badge-blue',
    shipped: 'badge-purple',
    delivered: 'badge-green',
    cancelled: 'badge-red',
  };
  return map[status] || 'badge-gray';
};

export const getOrderStatusLabel = (status) => {
  const map = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    ready_for_pickup: 'Ready for Pickup',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return map[status] || status;
};

// Slugify
export const slugify = (text) => text?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Truncate text
export const truncate = (text, len = 100) => {
  if (!text) return '';
  return text.length > len ? text.substring(0, len) + '...' : text;
};

// Scroll to top
export const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

// Calculate discount percent
export const calcDiscount = (original, selling) => {
  if (!original || original === 0) return 0;
  return Math.round(((original - selling) / original) * 100);
};

// Debounce
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// Time slots for service booking
export const TIME_SLOTS = [
  '8:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '12:00 PM - 2:00 PM',
  '2:00 PM - 4:00 PM',
  '4:00 PM - 6:00 PM',
  '6:00 PM - 8:00 PM',
];

// Payment methods
export const PAYMENT_METHODS = [
  { value: 'cash_at_shop', label: 'Cash at Shop', icon: '🏪' },
  { value: 'cash_on_delivery', label: 'Cash on Delivery', icon: '🏠' },
  { value: 'upi', label: 'UPI Payment', icon: '📱' },
];

