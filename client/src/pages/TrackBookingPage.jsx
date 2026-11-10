import { useState } from 'react';
import { Search, CheckCircle, Clock, Wrench, Truck, XCircle, AlertCircle } from 'lucide-react';
import { bookingAPI } from '../services/api';
import { formatDate, getBookingStatusLabel } from '../utils/helpers';
import PublicLayout from '../layouts/PublicLayout';

const statusSteps = [
  { key: 'pending', label: 'Pending', icon: <Clock size={16} /> },
  { key: 'contacted', label: 'Contacted', icon: <AlertCircle size={16} /> },
  { key: 'confirmed', label: 'Confirmed', icon: <CheckCircle size={16} /> },
  { key: 'assigned', label: 'Assigned', icon: <Wrench size={16} /> },
  { key: 'on_the_way', label: 'On The Way', icon: <Truck size={16} /> },
  { key: 'in_progress', label: 'In Progress', icon: <Wrench size={16} /> },
  { key: 'completed', label: 'Completed', icon: <CheckCircle size={16} /> },
];

const TrackBookingPage = () => {
  const [bookingId, setBookingId] = useState('');
  const [phone, setPhone] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!bookingId.trim() || !phone.trim()) return;
    setLoading(true); setError('');
    try {
      const { data } = await bookingAPI.track(bookingId.trim(), phone.trim());
      setBooking(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking not found. Check your Booking ID and phone number.');
      setBooking(null);
    } finally { setLoading(false); }
  };

  const currentStepIndex = booking ? statusSteps.findIndex(s => s.key === booking.status) : -1;

  return (
    <PublicLayout>
      <div className="bg-navy-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display font-bold text-4xl mb-3">Track Your Booking</h1>
          <p className="text-blue-200">Enter your booking ID and mobile number to check status</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto">
          <form onSubmit={handleTrack} className="card p-6 mb-6">
            <h2 className="font-semibold text-lg text-navy-900 mb-4">Search Booking</h2>
            <div className="space-y-3">
              <div>
                <label className="label">Booking ID</label>
                <input type="text" value={bookingId} onChange={e => setBookingId(e.target.value.toUpperCase())} placeholder="e.g. SB1A2B3C4D" className="input-field font-mono" />
              </div>
              <div>
                <label className="label">Registered Mobile Number</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit mobile number" maxLength={10} className="input-field" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                {loading ? 'Searching...' : <><Search size={16} /> Track Booking</>}
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
              <XCircle size={20} className="shrink-0" />{error}
            </div>
          )}

          {booking && (
            <div className="card p-6 animate-fade-in">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Booking ID</div>
                  <div className="font-mono font-bold text-xl text-navy-900">{booking.booking_id}</div>
                </div>
                <span className={`badge ${booking.status === 'completed' ? 'badge-green' : booking.status === 'cancelled' ? 'badge-red' : 'badge-blue'} text-sm px-3 py-1`}>
                  {getBookingStatusLabel(booking.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                <div><span className="text-gray-500">Customer:</span> <strong>{booking.customer_name}</strong></div>
                <div><span className="text-gray-500">Service:</span> <strong>{booking.service_name}</strong></div>
                <div><span className="text-gray-500">Category:</span> {booking.category_name}</div>
                <div><span className="text-gray-500">Date:</span> {formatDate(booking.preferred_date)}</div>
                {booking.technician_name && <div className="col-span-2"><span className="text-gray-500">Technician:</span> <strong>{booking.technician_name}</strong></div>}
              </div>

              {/* Progress Steps */}
              {booking.status !== 'cancelled' && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Progress</div>
                  <div className="flex items-center gap-1 overflow-x-auto pb-2">
                    {statusSteps.filter(s => s.key !== 'cancelled').map((step, i) => (
                      <div key={step.key} className="flex items-center">
                        <div className={`flex flex-col items-center ${i <= currentStepIndex ? 'text-electric-600' : 'text-gray-300'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i <= currentStepIndex ? 'bg-electric-100' : 'bg-gray-100'}`}>
                            {step.icon}
                          </div>
                          <span className="text-xs mt-1 whitespace-nowrap">{step.label}</span>
                        </div>
                        {i < statusSteps.filter(s => s.key !== 'cancelled').length - 1 && (
                          <div className={`w-8 h-0.5 mb-4 ${i < currentStepIndex ? 'bg-electric-400' : 'bg-gray-200'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default TrackBookingPage;

