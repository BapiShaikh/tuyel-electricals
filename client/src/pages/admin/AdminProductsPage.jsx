import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Eye, Package, AlertTriangle, X, Upload } from 'lucide-react';
import { productAPI, categoryAPI, brandAPI } from '../../services/api';
import { formatCurrency, getImageUrl, formatDate } from '../../utils/helpers';
import AdminLayout from '../../layouts/AdminLayout';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileRef = useRef();

  const [form, setForm] = useState({
    name: '', sku: '', model_number: '', category_id: '', brand_id: '', short_description: '',
    description: '', original_price: '', selling_price: '', stock_quantity: '', warranty_months: '',
    warranty_description: '', is_featured: false, is_bestseller: false, low_stock_threshold: '5', is_active: true
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      const { data } = await productAPI.getAll(params);
      setProducts(data.data || []);
      setPagination(data.pagination || {});
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page, categoryFilter]);
  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchProducts(); }, 400);
    return () => clearTimeout(timer);
  }, [search]);

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

  const openAdd = () => {
    setEditProduct(null);
    setForm({ name: '', sku: '', model_number: '', category_id: '', brand_id: '', short_description: '',
      description: '', original_price: '', selling_price: '', stock_quantity: '', warranty_months: '',
      warranty_description: '', is_featured: false, is_bestseller: false, low_stock_threshold: '5', is_active: true });
    setImages([]); setImagePreviews([]);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name || '', sku: product.sku || '', model_number: product.model_number || '',
      category_id: product.category_id || '', brand_id: product.brand_id || '',
      short_description: product.short_description || '', description: product.description || '',
      original_price: product.original_price || '', selling_price: product.selling_price || '',
      stock_quantity: product.stock_quantity || '', warranty_months: product.warranty_months || '',
      warranty_description: product.warranty_description || '', is_featured: !!product.is_featured,
      is_bestseller: !!product.is_bestseller, low_stock_threshold: product.low_stock_threshold || '5',
      is_active: product.is_active !== 0
    });
    setImages([]); setImagePreviews([]);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setImagePreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach(img => fd.append('images', img));
      if (editProduct) {
        await productAPI.update(editProduct.id, fd);
      } else {
        await productAPI.create(fd);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to deactivate this product?')) return;
    try {
      await productAPI.delete(id);
      fetchProducts();
    } catch {}
  };

  return (
    <AdminLayout title="Products">
      {/* Header */}
      <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="input-field pl-9 py-2 text-sm" />
          </div>
          <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }} className="input-field py-2 text-sm w-auto">
            <option value="">All Categories</option>
            {categories.filter(c => !c.parent_id).map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <button onClick={openAdd} className="btn-primary py-2 text-sm">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-3 mb-5 text-sm text-gray-600">
        <span className="font-medium">{pagination.total} products total</span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? [...Array(8)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-48" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-12" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                </tr>
              )) : products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        <img
                          src={getImageUrl(product.primary_image, product.name)}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80';
                          }}
                        />
                      </div>
                      <div>
                        <div className="font-medium text-navy-900 max-w-xs truncate">{product.name}</div>
                        <div className="text-xs text-gray-400">{product.brand_name} {product.sku ? `· ${product.sku}` : ''}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{product.category_name || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{formatCurrency(product.selling_price)}</div>
                    {product.original_price > product.selling_price && (
                      <div className="text-xs text-gray-400 line-through">{formatCurrency(product.original_price)}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${product.stock_quantity <= 5 ? 'text-red-600' : 'text-gray-700'}`}>
                      {product.stock_quantity}
                      {product.stock_quantity <= 5 && <AlertTriangle size={12} className="inline ml-1" />}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${product.is_active ? 'badge-green' : 'badge-red'}`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Link to={`/shop/product/${product.slug}`} target="_blank" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500" title="View"><Eye size={15} /></Link>
                      <button onClick={() => openEdit(product)} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-blue-600" title="Edit"><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(product.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-500" title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            {[...Array(pagination.pages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-electric-500 text-white' : 'border hover:border-electric-400'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-start justify-center p-4 pt-10">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-display font-bold text-xl text-navy-900">{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 max-h-[75vh] overflow-y-auto space-y-4">
              {/* Basic Info */}
              <div>
                <label className="label">Product Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Category</label>
                  <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="input-field">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.parent_id ? `  └ ${c.name}` : c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Brand</label>
                  <select value={form.brand_id} onChange={e => setForm(f => ({ ...f, brand_id: e.target.value }))} className="input-field">
                    <option value="">Select Brand</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">SKU</label>
                  <input type="text" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className="input-field" placeholder="e.g. HVL-LED-9W" />
                </div>
                <div>
                  <label className="label">Model Number</label>
                  <input type="text" value={form.model_number} onChange={e => setForm(f => ({ ...f, model_number: e.target.value }))} className="input-field" />
                </div>
              </div>
              <div>
                <label className="label">Short Description</label>
                <input type="text" value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} className="input-field" maxLength={500} />
              </div>
              <div>
                <label className="label">Full Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="input-field resize-none" />
              </div>
              {/* Pricing */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Original Price ₹ *</label>
                  <input type="number" required min="0" step="0.01" value={form.original_price} onChange={e => setForm(f => ({ ...f, original_price: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="label">Selling Price ₹ *</label>
                  <input type="number" required min="0" step="0.01" value={form.selling_price} onChange={e => setForm(f => ({ ...f, selling_price: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="label">Stock Qty *</label>
                  <input type="number" required min="0" value={form.stock_quantity} onChange={e => setForm(f => ({ ...f, stock_quantity: e.target.value }))} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Warranty (months)</label>
                  <input type="number" min="0" value={form.warranty_months} onChange={e => setForm(f => ({ ...f, warranty_months: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="label">Low Stock Alert Qty</label>
                  <input type="number" min="0" value={form.low_stock_threshold} onChange={e => setForm(f => ({ ...f, low_stock_threshold: e.target.value }))} className="input-field" />
                </div>
              </div>
              {/* Flags */}
              <div className="flex gap-4">
                {[['is_featured', 'Featured'], ['is_bestseller', 'Best Seller'], ['is_active', 'Active']].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} className="w-4 h-4 accent-electric-600" />
                    <span className="text-sm font-medium">{label}</span>
                  </label>
                ))}
              </div>
              {/* Images */}
              <div>
                <label className="label">Product Images</label>
                <label className="flex items-center gap-3 p-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-electric-400 transition-colors">
                  <Upload size={20} className="text-gray-400" />
                  <span className="text-sm text-gray-500">Click to select images (max 10, 5MB each)</span>
                  <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                {imagePreviews.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {imagePreviews.map((src, i) => (
                      <img key={i} src={src} alt="" className="w-16 h-16 object-contain border rounded-lg bg-gray-50" />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? 'Saving...' : editProduct ? 'Update Product' : 'Add Product'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1 justify-center border border-gray-200">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProductsPage;

