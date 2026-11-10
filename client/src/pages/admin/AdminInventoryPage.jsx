import { useState, useEffect } from 'react';
import { AlertTriangle, Package } from 'lucide-react';
import { settingsAPI } from '../../services/api';
import { formatCurrency, getImageUrl } from '../../utils/helpers';
import AdminLayout from '../../layouts/AdminLayout';

const AdminInventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (lowStockOnly) params.low_stock = 'true';
      const { data } = await settingsAPI.getInventory(params);
      setProducts(data.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchInventory(); }, [lowStockOnly]);

  const lowCount = products.filter(p => p.stock_quantity <= p.low_stock_threshold).length;

  return (
    <AdminLayout title="Inventory">
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div className="flex gap-3">
          <div className="card px-4 py-3 flex items-center gap-2">
            <Package size={18} className="text-electric-500" />
            <div>
              <div className="text-xs text-gray-500">Total Products</div>
              <div className="font-bold text-navy-900">{products.length}</div>
            </div>
          </div>
          {lowCount > 0 && (
            <div className="card px-4 py-3 flex items-center gap-2 border-l-4 border-red-400">
              <AlertTriangle size={18} className="text-red-500" />
              <div>
                <div className="text-xs text-gray-500">Low Stock Alert</div>
                <div className="font-bold text-red-600">{lowCount} products</div>
              </div>
            </div>
          )}
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={lowStockOnly} onChange={e => setLowStockOnly(e.target.checked)} className="w-4 h-4 accent-red-500" />
          <span className="text-sm font-medium text-gray-700">Show low stock only</span>
        </label>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{['Product', 'SKU', 'Category', 'Brand', 'Stock', 'Alert At', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? [...Array(8)].map((_, i) => (
                <tr key={i} className="animate-pulse"><td colSpan={7} className="px-4 py-4"><div className="h-4 bg-gray-200 rounded" /></td></tr>
              )) : products.map(p => {
                const isLow = p.stock_quantity <= p.low_stock_threshold;
                return (
                  <tr key={p.id} className={`hover:bg-gray-50 ${isLow ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          {p.image ? <img src={getImageUrl(p.image)} alt="" className="w-full h-full object-contain" /> : <Package size={14} className="text-gray-300 m-auto mt-1" />}
                        </div>
                        <span className="font-medium text-navy-900 max-w-xs truncate">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.sku || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.category || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.brand || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${isLow ? 'text-red-600' : p.stock_quantity > 20 ? 'text-green-600' : 'text-orange-500'}`}>
                        {p.stock_quantity}
                        {isLow && <AlertTriangle size={12} className="inline ml-1" />}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.low_stock_threshold}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${p.stock_quantity === 0 ? 'badge-red' : isLow ? 'badge-yellow' : 'badge-green'}`}>
                        {p.stock_quantity === 0 ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminInventoryPage;

