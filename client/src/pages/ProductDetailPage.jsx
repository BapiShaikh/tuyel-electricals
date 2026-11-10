import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, MessageCircle, Phone, Shield, Truck, RotateCcw, Star, ChevronRight, ZoomIn, Minus, Plus, Check } from 'lucide-react';
import { productAPI } from '../services/api';
import { formatCurrency, getImageUrl } from '../utils/helpers';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import PublicLayout from '../layouts/PublicLayout';
import ProductCard from '../components/products/ProductCard';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();
  const { settings } = useSettings();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await productAPI.getOne(slug);
        setProduct(data.data);
        if (data.data.category_id) {
          const relRes = await productAPI.getAll({ category: data.data.category_slug, limit: 4 });
          setRelated(relRes.data.data.filter(p => p.id !== data.data.id).slice(0, 4));
        }
      } catch {}
      finally { setLoading(false); }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const getWhatsAppMsg = () => {
    const msg = `Hi! I'm interested in:\n\n*${product.name}*\nPrice: ${formatCurrency(product.selling_price)}\n\nPlease provide more details.`;
    return `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(msg)}`;
  };

  if (loading) return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="bg-gray-200 rounded-2xl h-96" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-10 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    </PublicLayout>
  );

  if (!product) return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Link to="/shop" className="btn-primary">Back to Shop</Link>
      </div>
    </PublicLayout>
  );

  const images = product.images || [];
  const currentImage = images[selectedImage]?.image_path || product.primary_image;
  const discount = product.original_price > product.selling_price
    ? Math.round(((product.original_price - product.selling_price) / product.original_price) * 100)
    : 0;

  return (
    <PublicLayout>
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-3">
        <div className="container mx-auto px-4 flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-electric-600">Home</Link>
          <ChevronRight size={14} />
          <Link to="/shop" className="hover:text-electric-600">Shop</Link>
          {product.category_name && <><ChevronRight size={14} /><Link to={`/shop?category=${product.category_slug}`} className="hover:text-electric-600">{product.category_name}</Link></>}
          <ChevronRight size={14} />
          <span className="text-gray-800 font-medium line-clamp-1">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div>
            {/* Main Image */}
            <div className="relative bg-gray-50 rounded-2xl overflow-hidden aspect-square mb-4 group shadow-sm">
              <img
                src={getImageUrl(currentImage, `${product.name} ${product.category_name || ''}`)}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80';
                }}
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  -{discount}% OFF
                </div>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 transition-all ${selectedImage === i ? 'border-electric-500' : 'border-transparent'}`}
                  >
                    <img src={getImageUrl(img.image_path)} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="text-sm text-electric-600 font-semibold mb-2">{product.brand_name}</div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-navy-900 mb-3">{product.name}</h1>

            {product.sku && <p className="text-xs text-gray-500 mb-3">SKU: {product.sku} {product.model_number && `| Model: ${product.model_number}`}</p>}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-navy-900">{formatCurrency(product.selling_price)}</span>
              {product.original_price > product.selling_price && (
                <span className="text-xl text-gray-400 line-through">{formatCurrency(product.original_price)}</span>
              )}
              {discount > 0 && <span className="text-green-600 font-semibold">Save {formatCurrency(product.original_price - product.selling_price)}</span>}
            </div>

            {/* Short Description */}
            {product.short_description && <p className="text-gray-600 mb-5 leading-relaxed">{product.short_description}</p>}

            {/* Stock & Warranty */}
            <div className="flex flex-wrap gap-3 mb-6">
              <span className={`badge ${product.stock_quantity > 0 ? 'badge-green' : 'badge-red'} text-sm px-3 py-1`}>
                {product.stock_quantity > 0 ? `✓ In Stock (${product.stock_quantity} available)` : '✗ Out of Stock'}
              </span>
              {product.warranty_months > 0 && (
                <span className="badge badge-blue text-sm px-3 py-1">
                  🛡️ {product.warranty_months >= 12 ? `${product.warranty_months / 12} Year` : `${product.warranty_months} Month`} Warranty
                </span>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            {product.stock_quantity > 0 && (
              <div className="mb-6">
                <label className="label mb-2">Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-3 font-semibold min-w-[3rem] text-center">{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                      <Plus size={16} />
                    </button>
                  </div>
                  <button onClick={handleAddToCart} className={`flex-1 btn-primary py-3 ${addedToCart ? 'bg-green-500 hover:bg-green-600' : ''}`}>
                    {addedToCart ? <><Check size={18} /> Added!</> : <><ShoppingCart size={18} /> Add to Cart</>}
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link to="/cart" className="btn-secondary flex-1 justify-center py-3">
                <ShoppingCart size={18} /> View Cart & Order
              </Link>
              <a href={getWhatsAppMsg()} target="_blank" rel="noopener noreferrer" className="flex-1 btn-primary bg-green-500 hover:bg-green-600 py-3 justify-center">
                <MessageCircle size={18} /> WhatsApp Enquiry
              </a>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Shield size={18} className="text-electric-500" />, text: 'Genuine Product' },
                { icon: <Truck size={18} className="text-green-500" />, text: 'Fast Delivery' },
                { icon: <RotateCcw size={18} className="text-orange-500" />, text: 'Easy Returns' },
              ].map(f => (
                <div key={f.text} className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-xl text-center">
                  {f.icon}
                  <span className="text-xs text-gray-600 font-medium">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-10">
            <h2 className="font-display font-bold text-2xl text-navy-900 mb-4">Product Description</h2>
            <div className="card p-6">
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>
          </div>
        )}

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display font-bold text-2xl text-navy-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default ProductDetailPage;
