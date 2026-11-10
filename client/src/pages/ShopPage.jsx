import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, X, ChevronDown, SlidersHorizontal, Grid, List, Search } from 'lucide-react';
import { productAPI, categoryAPI, brandAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import PublicLayout from '../layouts/PublicLayout';
import ProductCard from '../components/products/ProductCard';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const search = searchParams.get('search') || '';
  const featured = searchParams.get('featured') || '';
  const bestseller = searchParams.get('bestseller') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'created_at';
  const order = searchParams.get('order') || 'DESC';
  const page = parseInt(searchParams.get('page') || '1');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (category) params.category = category;
      if (brand) params.brand = brand;
      if (search) params.search = search;
      if (featured) params.featured = featured;
      if (bestseller) params.bestseller = bestseller;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (sort) params.sort = sort;
      if (order) params.order = order;
      const { data } = await productAPI.getAll(params);
      setProducts(data.data || []);
      setPagination(data.pagination || { total: 0, page: 1, pages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, brand, search, featured, bestseller, minPrice, maxPrice, sort, order, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([categoryAPI.getAll(), brandAPI.getAll()]);
        setCategories(catRes.data.flat || []);
        setBrands(brandRes.data.data || []);
      } catch {}
    };
    fetchFilters();
  }, []);

  const updateFilter = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const clearFilters = () => setSearchParams({});

  const hasFilters = category || brand || search || featured || bestseller || minPrice || maxPrice;

  const sortOptions = [
    { value: 'created_at|DESC', label: 'Newest First' },
    { value: 'selling_price|ASC', label: 'Price: Low to High' },
    { value: 'selling_price|DESC', label: 'Price: High to Low' },
    { value: 'name|ASC', label: 'Name: A-Z' },
    { value: 'views|DESC', label: 'Most Popular' },
  ];

  return (
    <PublicLayout>
      {/* Page Header */}
      <div className="bg-navy-900 text-white py-10">
        <div className="container mx-auto px-4">
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">
            {search ? `Search: "${search}"` : category ? categories.find(c => c.slug === category)?.name || 'Products' : 'All Products'}
          </h1>
          <div className="flex items-center gap-2 text-sm text-blue-200">
            <Link to="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span>Shop</span>
            {category && <><span>/</span><span>{categories.find(c => c.slug === category)?.name}</span></>}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:border-electric-400 transition-colors text-sm font-medium"
            >
              <SlidersHorizontal size={16} />
              Filters
              {hasFilters && <span className="w-2 h-2 bg-brand-orange rounded-full"></span>}
            </button>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors">
                <X size={14} /> Clear All
              </button>
            )}
            <span className="text-sm text-gray-500">{pagination.total} products found</span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={`${sort}|${order}`}
              onChange={e => { const [s, o] = e.target.value.split('|'); updateFilter('sort', s); updateFilter('order', o); }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-electric-400"
            >
              {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-electric-500 text-white' : 'hover:bg-gray-50'}`}>
                <Grid size={16} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-electric-500 text-white' : 'hover:bg-gray-50'}`}>
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          {showFilters && (
            <aside className="w-64 shrink-0">
              <div className="card p-4 space-y-6 sticky top-24">
                {/* Search */}
                <div>
                  <label className="label">Search</label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      defaultValue={search}
                      onKeyDown={e => { if (e.key === 'Enter') updateFilter('search', e.target.value); }}
                      placeholder="Search products..."
                      className="input-field pl-9"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="label">Category</label>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    <button onClick={() => updateFilter('category', '')} className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${!category ? 'bg-electric-50 text-electric-700 font-medium' : 'hover:bg-gray-50'}`}>
                      All Categories
                    </button>
                    {categories.filter(c => !c.parent_id).map(cat => (
                      <div key={cat.id}>
                        <button onClick={() => updateFilter('category', cat.slug)} className={`w-full text-left px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${category === cat.slug ? 'bg-electric-50 text-electric-700' : 'hover:bg-gray-50 text-gray-700'}`}>
                          {cat.name}
                        </button>
                        {cat.children?.map(child => (
                          <button key={child.id} onClick={() => updateFilter('category', child.slug)} className={`w-full text-left pl-6 pr-3 py-1 text-xs rounded-lg transition-colors ${category === child.slug ? 'bg-electric-50 text-electric-700 font-medium' : 'hover:bg-gray-50 text-gray-500'}`}>
                            └ {child.name}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <label className="label">Brand</label>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    <button onClick={() => updateFilter('brand', '')} className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${!brand ? 'bg-electric-50 text-electric-700 font-medium' : 'hover:bg-gray-50'}`}>
                      All Brands
                    </button>
                    {brands.map(b => (
                      <button key={b.id} onClick={() => updateFilter('brand', b.slug)} className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${brand === b.slug ? 'bg-electric-50 text-electric-700 font-medium' : 'hover:bg-gray-50'}`}>
                        {b.name}
                        {b.product_count > 0 && <span className="ml-1 text-gray-400 text-xs">({b.product_count})</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="label">Price Range</label>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Min ₹" defaultValue={minPrice} onBlur={e => updateFilter('minPrice', e.target.value)} className="input-field text-sm py-2" />
                    <input type="number" placeholder="Max ₹" defaultValue={maxPrice} onBlur={e => updateFilter('maxPrice', e.target.value)} className="input-field text-sm py-2" />
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="card overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-5 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try different filters or search terms</p>
                <button onClick={clearFilters} className="btn-outline">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
                  {products.map(product => (
                    viewMode === 'grid' ? (
                      <ProductCard key={product.id} product={product} />
                    ) : (
                      <div key={product.id} className="card flex gap-4 p-4 hover:shadow-card-hover transition-shadow">
                        <Link to={`/shop/product/${product.slug}`} className="w-32 h-32 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                          {product.primary_image ? (
                            <img src={`http://localhost:5000${product.primary_image}`} alt={product.name} className="w-full h-full object-contain" />
                          ) : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Image</div>}
                        </Link>
                        <div className="flex-1">
                          <div className="text-xs text-electric-600 font-semibold">{product.brand_name}</div>
                          <Link to={`/shop/product/${product.slug}`} className="font-semibold text-navy-900 hover:text-electric-600 transition-colors">{product.name}</Link>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.short_description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="font-bold text-navy-900 text-lg">{formatCurrency(product.selling_price)}</span>
                            {product.original_price > product.selling_price && <span className="text-gray-400 line-through text-sm">{formatCurrency(product.original_price)}</span>}
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {[...Array(pagination.pages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => updateFilter('page', String(i + 1))}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                          page === i + 1 ? 'bg-electric-500 text-white' : 'border border-gray-200 hover:border-electric-400'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ShopPage;
