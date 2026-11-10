import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Wrench, ShoppingBag, ClipboardList, AlertTriangle, TrendingUp, Users, IndianRupee, ArrowUpRight } from 'lucide-react';
import { dashboardAPI } from '../../services/api';
import { formatCurrency, formatDate, getBookingStatusBadge, getBookingStatusLabel, getOrderStatusBadge, getOrderStatusLabel } from '../../utils/helpers';
import AdminLayout from '../../layouts/AdminLayout';

const StatCard = ({ icon, label, value, sub, color, link }) => (
  <Link to={link || '#'} className="card p-5 flex items-center gap-4 hover:shadow-card-hover transition-all group">
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0`}>{icon}</div>
    <div className="flex-1 min-w-0">
      <div className="text-sm text-gray-500 font-medium">{label}</div>
      <div className="text-2xl font-bold text-navy-900 mt-0.5">{value ?? '...'}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
    <ArrowUpRight size={16} className="text-gray-300 group-hover:text-electric-500 transition-colors" />
  </Link>
);

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, ordersRes, bookingsRes, productsRes] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getRecentOrders(),
          dashboardAPI.getRecentBookings(),
          dashboardAPI.getPopularProducts(),
        ]);
        setStats(statsRes.data.data);
        setRecentOrders(ordersRes.data.data || []);
        setRecentBookings(bookingsRes.data.data || []);
        setPopularProducts(productsRes.data.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  return (
    <AdminLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard icon={<Package size={22} className="text-electric-500" />} label="Products" value={stats?.total_products} color="bg-electric-50" link="/admin/products" />
        <StatCard icon={<Wrench size={22} className="text-orange-500" />} label="Services" value={stats?.total_services} color="bg-orange-50" link="/admin/services" />
        <StatCard icon={<ShoppingBag size={22} className="text-purple-500" />} label="Total Orders" value={stats?.total_orders} sub={stats ? `${stats.pending_orders || 0} pending` : undefined} color="bg-purple-50" link="/admin/orders" />
        <StatCard icon={<ClipboardList size={22} className="text-blue-500" />} label="Bookings" value={stats?.total_bookings} sub={stats ? `${stats.pending_bookings || 0} pending` : undefined} color="bg-blue-50" link="/admin/bookings" />
        <StatCard icon={<Users size={22} className="text-green-500" />} label="Customers" value={stats?.total_customers} color="bg-green-50" link="/admin/customers" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-5 col-span-1">
          <div className="flex items-center gap-3 mb-1">
            <IndianRupee size={22} className="text-green-500" />
            <span className="text-gray-500 text-sm">Monthly Revenue</span>
          </div>
          <div className="text-3xl font-bold text-navy-900">{formatCurrency(stats?.monthly_sales || 0)}</div>
          <div className="text-xs text-gray-400 mt-1">This month's sales</div>
        </div>
        <div className="card p-5 col-span-1">
          <div className="flex items-center gap-3 mb-1">
            <AlertTriangle size={22} className="text-red-500" />
            <span className="text-gray-500 text-sm">Low Stock Alert</span>
          </div>
          <div className="text-3xl font-bold text-red-600">{stats?.low_stock_products || 0}</div>
          <Link to="/admin/inventory?low_stock=true" className="text-xs text-electric-600 hover:underline mt-1 block">View low stock products →</Link>
        </div>
        <div className="card p-5 col-span-1">
          <div className="flex items-center gap-3 mb-1">
            <TrendingUp size={22} className="text-blue-500" />
            <span className="text-gray-500 text-sm">Monthly Bookings</span>
          </div>
          <div className="text-3xl font-bold text-navy-900">{stats?.monthly_bookings || 0}</div>
          <div className="text-xs text-gray-400 mt-1">Service requests this month</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-display font-bold text-navy-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-electric-600 hover:underline">View All</Link>
          </div>
          <div className="divide-y">
            {loading ? [...Array(5)].map((_, i) => (
              <div key={i} className="p-4 animate-pulse flex gap-3"><div className="h-4 bg-gray-200 rounded flex-1" /></div>
            )) : recentOrders.slice(0, 6).map(order => (
              <Link key={order.id} to={`/admin/orders/${order.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div>
                  <div className="font-mono text-sm font-semibold text-navy-900">{order.order_id}</div>
                  <div className="text-xs text-gray-500">{order.customer_name} · {formatDate(order.created_at)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{formatCurrency(order.total_amount)}</span>
                  <span className={`badge ${getOrderStatusBadge(order.status)}`}>{getOrderStatusLabel(order.status)}</span>
                </div>
              </Link>
            ))}
            {recentOrders.length === 0 && !loading && <div className="p-6 text-center text-gray-400 text-sm">No orders yet</div>}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-display font-bold text-navy-900">Recent Bookings</h2>
            <Link to="/admin/bookings" className="text-sm text-electric-600 hover:underline">View All</Link>
          </div>
          <div className="divide-y">
            {loading ? [...Array(5)].map((_, i) => (
              <div key={i} className="p-4 animate-pulse flex gap-3"><div className="h-4 bg-gray-200 rounded flex-1" /></div>
            )) : recentBookings.slice(0, 6).map(booking => (
              <Link key={booking.id} to={`/admin/bookings/${booking.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div>
                  <div className="font-mono text-sm font-semibold text-navy-900">{booking.booking_id}</div>
                  <div className="text-xs text-gray-500">{booking.customer_name} · {booking.service_name}</div>
                </div>
                <span className={`badge ${getBookingStatusBadge(booking.status)}`}>{getBookingStatusLabel(booking.status)}</span>
              </Link>
            ))}
            {recentBookings.length === 0 && !loading && <div className="p-6 text-center text-gray-400 text-sm">No bookings yet</div>}
          </div>
        </div>
      </div>

      {/* Popular Products */}
      {popularProducts.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-display font-bold text-navy-900">Popular Products</h2>
            <Link to="/admin/products" className="text-sm text-electric-600 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>{['Product', 'Price', 'Stock', 'Views', 'Orders'].map(h => <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {popularProducts.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-navy-900">{p.name}</td>
                    <td className="px-4 py-3">{formatCurrency(p.selling_price)}</td>
                    <td className="px-4 py-3">
                      <span className={p.stock_quantity <= 5 ? 'text-red-600 font-semibold' : ''}>{p.stock_quantity}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.views}</td>
                    <td className="px-4 py-3 font-semibold">{p.order_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboardPage;

