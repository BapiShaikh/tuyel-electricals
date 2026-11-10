import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader } from 'lucide-react';
import { productAPI } from '../../services/api';
import { getImageUrl, formatCurrency } from '../../utils/helpers';

const SearchModal = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await productAPI.getAll({ search: query, limit: 6 });
        setResults(data.data || []);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (product) => {
    navigate(`/shop/product/${product.slug}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 p-4 border-b">
          <Search className="text-gray-400" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search for products, brands, categories..."
            className="flex-1 text-lg outline-none"
          />
          {loading ? <Loader size={20} className="text-electric-500 animate-spin" /> : null}
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {results.length > 0 && (
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {results.map(product => (
              <button
                key={product.id}
                onClick={() => handleSelect(product)}
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  {product.primary_image ? (
                    <img src={getImageUrl(product.primary_image)} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.brand_name} · {product.category_name}</p>
                </div>
                <span className="text-electric-600 font-bold shrink-0">{formatCurrency(product.selling_price)}</span>
              </button>
            ))}
            <button
              onClick={() => { navigate(`/shop?search=${query}`); onClose(); }}
              className="w-full p-3 text-center text-electric-600 hover:bg-electric-50 text-sm font-medium transition-colors"
            >
              View all results for "{query}" →
            </button>
          </div>
        )}

        {query.length >= 2 && !loading && results.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <p>No products found for "<strong>{query}</strong>"</p>
            <p className="text-sm mt-1">Try different keywords</p>
          </div>
        )}

        {!query && (
          <div className="p-6">
            <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-3">Popular Searches</p>
            <div className="flex flex-wrap gap-2">
              {['LED Bulb', 'Ceiling Fan', 'MCB', 'Wire', 'Water Pump', 'Inverter', 'Havells', 'Crompton'].map(term => (
                <button key={term} onClick={() => setQuery(term)} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-electric-50 hover:text-electric-600 transition-colors">
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;

