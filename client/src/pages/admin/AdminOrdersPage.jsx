import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Save, MessageCircle } from 'lucide-react';
import { orderAPI } from '../../services/api';
import { formatCurrency, formatDate, formatDateTime, getOrderStatusBadge, getOrderStatusLabel, getImageUrl } from '../../utils/helpers';
import AdminLayout from '../../layouts/AdminLayout';

const ORDER_STATUSES = ['pending','confirmed','processing','ready_for_pickup','shipped','delivered','cancelled'];
const PAYMENT_STATUSES = ['pending','paid','failed'];

export const AdminOrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await orderAPI.getAll(params);
      setOrders(data.data || []);
      setPagination(data.pagination || {});
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);
  useEffect(() => { const t = setTimeout(fetchOrders, 400); return () => clearTimeout(t); }, [search]);

  return (
    <AdminLayout title="Orders">
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." className="input-field pl-9 py-2 text-sm w-full" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field py-2 text-sm w-auto">
          <option value="">All Status</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{getOrderStatusLabel(s)}</option>)}
        </select>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{['Order ID', 'Customer', 'Amount', 'Payment', 'Date', 'Status', 'Action'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? [...Array(8)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={7} className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-full" /></td></tr>)
              : orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-semibold text-navy-900">{order.order_id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{order.customer_name}</div>
                    <div className="text-xs text-gray-500">{order.customer_phone}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(order.total_amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${order.payment_status === 'paid' ? 'badge-green' : order.payment_status === 'failed' ? 'badge-red' : 'badge-yellow'}`}>{order.payment_status}</span>
                    <div className="text-xs text-gray-400 mt-0.5">{order.payment_method?.replace(/_/g, ' ')}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3"><span className={`badge ${getOrderStatusBadge(order.status)}`}>{getOrderStatusLabel(order.status)}</span></td>
                  <td className="px-4 py-3"><Link to={`/admin/orders/${order.id}`} className="text-electric-600 hover:text-electric-800 font-medium">View →</Link></td>
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

export const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ status: '', payment_status: '' });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await orderAPI.getOne(id);
        setOrder(data.data);
        setForm({ status: data.data.status, payment_status: data.data.payment_status });
      } catch {}
      finally { setLoading(false); }
    };
    fetchOrder();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await orderAPI.updateStatus(id, form);
      const { data } = await orderAPI.getOne(id);
      setOrder(data.data);
      alert('Order updated!');
    } catch { alert('Update failed'); }
    finally { setUpdating(false); }
  };

  if (loading) return <AdminLayout title="Order Details"><div className="flex items-center justify-center h-64"><div className="spinner w-10 h-10" /></div></AdminLayout>;
  if (!order) return <AdminLayout title="Order Details"><div className="text-center py-16 text-gray-500">Order not found</div></AdminLayout>;

  return (
    <AdminLayout title={`Order: ${order.order_id}`}>
      <button onClick={() => navigate('/admin/orders')} className="flex items-center gap-1 text-electric-600 hover:underline mb-6 text-sm">
        <ArrowLeft size={14} /> Back to Orders
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-5">
            <h2 className="font-display font-bold text-navy-900 mb-4">Customer Details</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Name:</span> <strong>{order.customer_name}</strong></div>
              <div><span className="text-gray-500">Phone:</span> <a href={`tel:${order.customer_phone}`} className="text-electric-600 hover:underline">{order.customer_phone}</a></div>
              <div className="col-span-2"><span className="text-gray-500">Address:</span> {order.address}{order.village ? `, ${order.village}` : ''}{order.pin_code ? ` - ${order.pin_code}` : ''}</div>
              <div><span className="text-gray-500">Payment:</span> {order.payment_method?.replace(/_/g, ' ')}</div>
              <div><span className="text-gray-500">Order Date:</span> {formatDateTime(order.created_at)}</div>
              {order.order_notes && <div className="col-span-2"><span className="text-gray-500">Notes:</span> {order.order_notes}</div>}
            </div>
          </div>
          <div className="card p-5">
            <h2 className="font-display font-bold text-navy-900 mb-4">Order Items</h2>
            <div className="space-y-3">
              {(order.items || []).map(item => (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    {item.product_image ? <img src={getImageUrl(item.product_image)} alt="" className="w-full h-full object-contain" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">⚡</div>}
                  </div>
                  <div className="flex-1"><div className="font-medium">{item.product_name}</div><div className="text-xs text-gray-500">{item.product_sku}</div></div>
                  <div className="text-sm text-gray-600">×{item.quantity}</div>
                  <div className="font-semibold">{formatCurrency(item.total_price)}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t">
              <span>Total</span>
              <span className="text-navy-900">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>
        <div>
          <div className="card p-5 sticky top-24">
            <h2 className="font-display font-bold text-navy-900 mb-4">Update Order</h2>
            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="label">Order Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-field">
                  {ORDER_STATUSES.map(s => <option key={s} value={s}>{getOrderStatusLabel(s)}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Payment Status</label>
                <select value={form.payment_status} onChange={e => setForm(f => ({ ...f, payment_status: e.target.value }))} className="input-field">
                  {PAYMENT_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>
              <button type="submit" disabled={updating} className="btn-primary w-full justify-center">
                <Save size={16} /> {updating ? 'Updating...' : 'Update Order'}
              </button>
            </form>
            <div className="mt-4 pt-4 border-t">
              <a href={`https://wa.me/${order.customer_phone}?text=${encodeURIComponent(`Hi ${order.customer_name}! Regarding your order ${order.order_id}. `)}`}
                target="_blank" rel="noopener noreferrer" className="btn-primary bg-green-500 hover:bg-green-600 w-full justify-center py-2 text-sm">
                <MessageCircle size={16} /> WhatsApp Customer
              </a>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderListPage;

