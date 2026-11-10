import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { settingsAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import AdminLayout from '../../layouts/AdminLayout';

const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      const { data } = await settingsAPI.getCustomers(params);
      setCustomers(data.data || []);
      setPagination(data.pagination || {});
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCustomers(); }, [page]);
  useEffect(() => { const t = setTimeout(fetchCustomers, 400); return () => clearTimeout(t); }, [search]);

  return (
    <AdminLayout title="Customers">
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or phone..." className="input-field pl-9 py-2 text-sm w-full" />
        </div>
        <span className="text-sm text-gray-500 self-center">{pagination.total || 0} customers</span>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{['Name', 'Phone', 'Village', 'PIN', 'Orders', 'Bookings', 'Joined'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? [...Array(8)].map((_, i) => (
                <tr key={i} className="animate-pulse"><td colSpan={7} className="px-4 py-4"><div className="h-4 bg-gray-200 rounded" /></td></tr>
              )) : customers.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-navy-900">{c.name}</td>
                  <td className="px-4 py-3"><a href={`tel:${c.phone}`} className="text-electric-600 hover:underline">{c.phone}</a></td>
                  <td className="px-4 py-3 text-gray-600">{c.village || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.pin_code || '-'}</td>
                  <td className="px-4 py-3 font-semibold">{c.total_orders}</td>
                  <td className="px-4 py-3 font-semibold">{c.total_bookings}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            {[...Array(pagination.pages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-electric-500 text-white' : 'border hover:border-electric-400'}`}>{i + 1}</button>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCustomersPage;
