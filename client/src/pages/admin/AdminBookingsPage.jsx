import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronRight, User, Phone, MapPin, Calendar, Clock, FileText, Image, ArrowLeft, Save, MessageCircle } from 'lucide-react';
import { bookingAPI, serviceAPI } from '../../services/api';
import { formatDate, formatDateTime, getBookingStatusBadge, getBookingStatusLabel, getImageUrl } from '../../utils/helpers';
import AdminLayout from '../../layouts/AdminLayout';

const BOOKING_STATUSES = ['pending','contacted','confirmed','assigned','on_the_way','in_progress','completed','cancelled'];

// Booking List Page
export const AdminBookingListPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const { data } = await bookingAPI.getAll(params);
      setBookings(data.data || []);
      setPagination(data.pagination || {});
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, [page, statusFilter, dateFrom, dateTo]);
  useEffect(() => { const t = setTimeout(fetchBookings, 400); return () => clearTimeout(t); }, [search]);

  return (
    <AdminLayout title="Service Bookings">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID, name, phone..." className="input-field pl-9 py-2 text-sm w-full" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field py-2 text-sm w-auto">
          <option value="">All Status</option>
          {BOOKING_STATUSES.map(s => <option key={s} value={s}>{getBookingStatusLabel(s)}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input-field py-2 text-sm w-auto" placeholder="From date" />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input-field py-2 text-sm w-auto" placeholder="To date" />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{['Booking ID', 'Customer', 'Service', 'Date', 'Status', 'Action'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? [...Array(8)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-28" /></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-12" /></td>
                </tr>
              )) : bookings.map(booking => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-semibold text-navy-900">{booking.booking_id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{booking.customer_name}</div>
                    <div className="text-xs text-gray-500">{booking.customer_phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{booking.service_name}</div>
                    <div className="text-xs text-gray-400">{booking.category_name}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(booking.preferred_date)}</td>
                  <td className="px-4 py-3"><span className={`badge ${getBookingStatusBadge(booking.status)}`}>{getBookingStatusLabel(booking.status)}</span></td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/bookings/${booking.id}`} className="text-electric-600 hover:text-electric-800 font-medium">View →</Link>
                  </td>
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

// Booking Detail Page
export const AdminBookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState({ status: '', technician_name: '', internal_notes: '', service_charge: '', completion_date: '' });

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data } = await bookingAPI.getOne(id);
        setBooking(data.data);
        setForm({ status: data.data.status, technician_name: data.data.technician_name || '',
          internal_notes: data.data.internal_notes || '', service_charge: data.data.service_charge || '',
          completion_date: data.data.completion_date ? data.data.completion_date.split('T')[0] : '' });
      } catch {}
      finally { setLoading(false); }
    };
    fetchBooking();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await bookingAPI.updateStatus(id, form);
      const { data } = await bookingAPI.getOne(id);
      setBooking(data.data);
      alert('Booking updated successfully!');
    } catch (err) { alert('Update failed'); }
    finally { setUpdating(false); }
  };

  if (loading) return <AdminLayout title="Booking Details"><div className="flex items-center justify-center h-64"><div className="spinner w-10 h-10" /></div></AdminLayout>;
  if (!booking) return <AdminLayout title="Booking Details"><div className="text-center py-16 text-gray-500">Booking not found</div></AdminLayout>;

  return (
    <AdminLayout title={`Booking: ${booking.booking_id}`}>
      <button onClick={() => navigate('/admin/bookings')} className="flex items-center gap-1 text-electric-600 hover:underline mb-6 text-sm">
        <ArrowLeft size={14} /> Back to Bookings
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Cards */}
        <div className="lg:col-span-2 space-y-5">
          {/* Customer Info */}
          <div className="card p-5">
            <h2 className="font-display font-bold text-navy-900 mb-4 flex items-center gap-2"><User size={18} /> Customer Information</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Name:</span> <strong>{booking.customer_name}</strong></div>
              <div className="flex items-center gap-1"><Phone size={14} className="text-gray-400" /> <a href={`tel:${booking.customer_phone}`} className="text-electric-600 hover:underline">{booking.customer_phone}</a></div>
              <div className="col-span-2 flex items-start gap-1"><MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" /> <span>{booking.address}{booking.village ? `, ${booking.village}` : ''}{booking.pin_code ? ` - ${booking.pin_code}` : ''}</span></div>
            </div>
          </div>

          {/* Service Info */}
          <div className="card p-5">
            <h2 className="font-display font-bold text-navy-900 mb-4 flex items-center gap-2"><FileText size={18} /> Service Details</h2>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div><span className="text-gray-500">Category:</span> <strong>{booking.category_name}</strong></div>
              <div><span className="text-gray-500">Service:</span> <strong>{booking.service_name}</strong></div>
              <div><span className="text-gray-500">Preferred Date:</span> {formatDate(booking.preferred_date)}</div>
              <div><span className="text-gray-500">Time Slot:</span> {booking.preferred_time_slot || 'Any time'}</div>
              <div><span className="text-gray-500">Booked On:</span> {formatDateTime(booking.created_at)}</div>
              <div><span className="text-gray-500">Starting Price:</span> ₹{booking.starting_price}</div>
            </div>
            {booking.problem_description && (
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-2">Problem Description:</div>
                <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">{booking.problem_description}</div>
              </div>
            )}
          </div>

          {/* Problem Images */}
          {booking.images?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-display font-bold text-navy-900 mb-4 flex items-center gap-2"><Image size={18} /> Problem Photos</h2>
              <div className="flex gap-3 flex-wrap">
                {booking.images.map(img => (
                  <a key={img.id} href={getImageUrl(img.image_path)} target="_blank" rel="noopener noreferrer">
                    <img src={getImageUrl(img.image_path)} alt="Problem" className="w-24 h-24 object-cover rounded-xl border hover:border-electric-400 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          {booking.history?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-display font-bold text-navy-900 mb-4">Booking History</h2>
              <div className="space-y-3">
                {booking.history.map(h => (
                  <div key={h.id} className="flex gap-3 text-sm">
                    <div className="w-32 text-gray-400 shrink-0">{formatDateTime(h.created_at)}</div>
                    <div>
                      <span className={`badge ${getBookingStatusBadge(h.new_status)} mr-2`}>{getBookingStatusLabel(h.new_status)}</span>
                      {h.changed_by_name && <span className="text-gray-500">by {h.changed_by_name}</span>}
                      {h.notes && <div className="text-gray-500 mt-0.5">{h.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Update Panel */}
        <div>
          <div className="card p-5 sticky top-24">
            <h2 className="font-display font-bold text-navy-900 mb-4">Update Booking</h2>
            <div className="mb-4">
              <span className="text-sm text-gray-500">Current Status: </span>
              <span className={`badge ${getBookingStatusBadge(booking.status)}`}>{getBookingStatusLabel(booking.status)}</span>
            </div>
            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="label">Update Status *</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-field">
                  {BOOKING_STATUSES.map(s => <option key={s} value={s}>{getBookingStatusLabel(s)}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Assigned Technician</label>
                <input type="text" value={form.technician_name} onChange={e => setForm(f => ({ ...f, technician_name: e.target.value }))} placeholder="Technician name" className="input-field" />
              </div>
              <div>
                <label className="label">Service Charge (₹)</label>
                <input type="number" min="0" step="0.01" value={form.service_charge} onChange={e => setForm(f => ({ ...f, service_charge: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="label">Completion Date</label>
                <input type="date" value={form.completion_date} onChange={e => setForm(f => ({ ...f, completion_date: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="label">Internal Notes</label>
                <textarea value={form.internal_notes} onChange={e => setForm(f => ({ ...f, internal_notes: e.target.value }))} rows={3} placeholder="Internal notes visible only to admin..." className="input-field resize-none" />
              </div>
              <button type="submit" disabled={updating} className="btn-primary w-full justify-center">
                <Save size={16} /> {updating ? 'Saving...' : 'Update Booking'}
              </button>
            </form>

            {/* WhatsApp Contact */}
            <div className="mt-4 pt-4 border-t">
              <a
                href={`https://wa.me/${booking.customer_phone}?text=${encodeURIComponent(`Hi ${booking.customer_name}! Regarding your booking ${booking.booking_id} for ${booking.service_name}. `)}`}
                target="_blank" rel="noopener noreferrer"
                className="btn-primary bg-green-500 hover:bg-green-600 w-full justify-center py-2 text-sm"
              >
                <MessageCircle size={16} /> WhatsApp Customer
              </a>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBookingListPage;

