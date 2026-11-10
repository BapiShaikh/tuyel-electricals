import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Star, Zap } from 'lucide-react';
import { formatCurrency, getImageUrl, calcDiscount } from '../../utils/helpers';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const discount = product.discount_percent > 0 ? Math.round(product.discount_percent) : calcDiscount(product.original_price, product.selling_price);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div className="product-card group">
      <Link to={`/shop/product/${product.slug}`}>
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-50 aspect-square">
          <img
            src={getImageUrl(product.primary_image || product.images?.[0]?.image_path, `${product.name} ${product.category_name || ''}`)}
            alt={product.name}
            className="product-image w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80';
            }}
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                -{discount}%
              </span>
            )}
            {product.is_featured && (
              <span className="bg-electric-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                Featured
              </span>
            )}
            {product.stock_quantity === 0 && (
              <span className="bg-gray-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                Out of Stock
              </span>
            )}
          </div>
          
          {/* Quick actions on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100">
          </div>
        </div>

        {/* Content */}
        <div className="p-3 md:p-4">
          {product.brand_name && (
            <span className="text-xs text-electric-600 font-semibold uppercase tracking-wider">{product.brand_name}</span>
          )}
          <h3 className="font-medium text-gray-800 text-sm md:text-base line-clamp-2 mt-0.5 mb-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="font-bold text-navy-900 text-base md:text-lg">
              {formatCurrency(product.selling_price)}
            </span>
            {product.original_price > product.selling_price && (
              <span className="text-gray-400 line-through text-sm">
                {formatCurrency(product.original_price)}
              </span>
            )}
          </div>

          {/* Warranty */}
          {product.warranty_months > 0 && (
            <div className="text-xs text-green-600 mb-2">
              ✓ {product.warranty_months >= 12 ? `${product.warranty_months / 12} Year` : `${product.warranty_months} Month`} Warranty
            </div>
          )}
        </div>
      </Link>

      {/* Add to cart button */}
      <div className="px-3 pb-3 md:px-4 md:pb-4">
        <button
          onClick={handleAddToCart}
          disabled={product.stock_quantity === 0}
          className="w-full btn-primary py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={15} />
          {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

