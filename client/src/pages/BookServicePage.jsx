import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Wrench, CheckCircle, MessageCircle, Upload, X, Calendar, Clock } from 'lucide-react';
import { serviceAPI, bookingAPI } from '../services/api';
import { TIME_SLOTS } from '../utils/helpers';
import { useSettings } from '../context/SettingsContext';
import PublicLayout from '../layouts/PublicLayout';

const BookServicePage = () => {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const { settings } = useSettings();

  const initCategoryId = searchParams.get('category') || '';
  const initServiceId = searchParams.get('service') || '';

  const [form, setForm] = useState({
    service_category_id: initCategoryId,
    service_id: initServiceId,
    customer_name: '',
    customer_phone: '',
    address: '',
    village: '',
    pin_code: '',
    preferred_date: '',
    preferred_time_slot: '',
    problem_description: '',
    problem_image: null,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await serviceAPI.getCategories();
        setCategories(data.data || []);
      } catch {}
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!form.service_category_id) { setServices([]); return; }
    const fetchServices = async () => {
      try {
        const { data } = await serviceAPI.getAll({ category: categories.find(c => c.id == form.service_category_id)?.slug });
        setServices(data.data || []);
      } catch {}
    };
    if (categories.length > 0) fetchServices();
  }, [form.service_category_id, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(f => ({ ...f, problem_image: file }));
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs = {};
    if (!form.service_category_id) errs.service_category_id = 'Please select a service category';
    if (!form.service_id) errs.service_id = 'Please select a service';
    if (!form.customer_name.trim()) errs.customer_name = 'Name is required';
    if (!form.customer_phone.match(/^[6-9]\d{9}$/)) errs.customer_phone = 'Enter a valid 10-digit mobile number';
    if (!form.address.trim()) errs.address = 'Address is required';
    if (!form.preferred_date) errs.preferred_date = 'Please select a date';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== '') formData.append(k, v); });
      const { data } = await bookingAPI.create(formData);
      if (data.success) setSubmitted(data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  if (submitted) {
    return (
      <PublicLayout>
        <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
          <div className="max-w-lg w-full text-center card p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-500" size={40} />
            </div>
            <h2 className="font-display font-bold text-2xl text-navy-900 mb-2">Booking Submitted!</h2>
            <p className="text-gray-600 mb-6">Your service request has been received. We'll contact you shortly to confirm.</p>

            <div className="bg-navy-50 rounded-xl p-4 mb-6 text-left">
              <div className="text-sm text-gray-600 mb-1">Your Booking ID</div>
              <div className="font-mono font-bold text-2xl text-navy-900">{submitted.booking_id}</div>
              <div className="text-xs text-gray-500 mt-1">Save this for tracking your booking</div>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={submitted.whatsapp_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary bg-green-500 hover:bg-green-600 justify-center"
              >
                <MessageCircle size={18} />
                Also Notify via WhatsApp
              </a>
              <Link to="/track-booking" className="btn-outline justify-center">Track Your Booking</Link>
              <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">← Back to Home</Link>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-navy-900 text-white py-10">
        <div className="container mx-auto px-4">
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">Book a Service</h1>
          <p className="text-blue-200">Fill the form below and our team will confirm your appointment</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Selection */}
            <div className="card p-6">
              <h2 className="font-display font-semibold text-lg text-navy-900 mb-4 flex items-center gap-2">
                <Wrench size={20} className="text-electric-500" /> Select Service
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Service Category *</label>
                  <select name="service_category_id" value={form.service_category_id} onChange={handleChange} className={`input-field ${errors.service_category_id ? 'border-red-400' : ''}`}>
                    <option value="">Select a category...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.service_category_id && <p className="text-red-500 text-sm mt-1">{errors.service_category_id}</p>}
                </div>

                {services.length > 0 && (
                  <div>
                    <label className="label">Specific Service *</label>
                    <select name="service_id" value={form.service_id} onChange={handleChange} className={`input-field ${errors.service_id ? 'border-red-400' : ''}`}>
                      <option value="">Select a service...</option>
                      {services.map(s => <option key={s.id} value={s.id}>{s.name} - Starting ₹{s.starting_price}</option>)}
                    </select>
                    {errors.service_id && <p className="text-red-500 text-sm mt-1">{errors.service_id}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Customer Information */}
            <div className="card p-6">
              <h2 className="font-display font-semibold text-lg text-navy-900 mb-4">Your Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input type="text" name="customer_name" value={form.customer_name} onChange={handleChange} placeholder="Your name" className={`input-field ${errors.customer_name ? 'border-red-400' : ''}`} />
                  {errors.customer_name && <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>}
                </div>
                <div>
                  <label className="label">Mobile Number *</label>
                  <input type="tel" name="customer_phone" value={form.customer_phone} onChange={handleChange} placeholder="10-digit mobile number" maxLength={10} className={`input-field ${errors.customer_phone ? 'border-red-400' : ''}`} />
                  {errors.customer_phone && <p className="text-red-500 text-sm mt-1">{errors.customer_phone}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Address *</label>
                  <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="House no, street name" className={`input-field ${errors.address ? 'border-red-400' : ''}`} />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>
                <div>
                  <label className="label">Village / Area</label>
                  <input type="text" name="village" value={form.village} onChange={handleChange} placeholder="e.g. Sherpur, nearby village" className="input-field" />
                </div>
                <div>
                  <label className="label">PIN Code</label>
                  <input type="text" name="pin_code" value={form.pin_code} onChange={handleChange} placeholder="6-digit PIN code" maxLength={6} className="input-field" />
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="card p-6">
              <h2 className="font-display font-semibold text-lg text-navy-900 mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-electric-500" /> Preferred Schedule
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Preferred Date *</label>
                  <input type="date" name="preferred_date" value={form.preferred_date} onChange={handleChange} min={minDateStr} className={`input-field ${errors.preferred_date ? 'border-red-400' : ''}`} />
                  {errors.preferred_date && <p className="text-red-500 text-sm mt-1">{errors.preferred_date}</p>}
                </div>
                <div>
                  <label className="label">Preferred Time Slot</label>
                  <select name="preferred_time_slot" value={form.preferred_time_slot} onChange={handleChange} className="input-field">
                    <option value="">Any time</option>
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Problem Description */}
            <div className="card p-6">
              <h2 className="font-display font-semibold text-lg text-navy-900 mb-4">Problem Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Describe the Problem</label>
                  <textarea name="problem_description" value={form.problem_description} onChange={handleChange} rows={4} placeholder="Describe the issue in detail. E.g., 'Fan is running slowly and making noise after rain'" className="input-field resize-none" />
                </div>
                <div>
                  <label className="label">Upload Problem Photo (Optional)</label>
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="Problem" className="w-32 h-32 object-cover rounded-xl border" />
                      <button type="button" onClick={() => { setImagePreview(null); setForm(f => ({ ...f, problem_image: null })); }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-electric-400 hover:bg-electric-50 transition-colors">
                      <Upload size={24} className="text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Click to upload photo</span>
                      <span className="text-xs text-gray-400">JPG, PNG up to 5MB</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
              <strong>Note:</strong> Your booking is NOT automatically confirmed. Our team will review your request and call you to confirm within 2-4 hours during business hours (8 AM – 8 PM).
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg">
              {loading ? (
                <><div className="spinner w-5 h-5" /> Submitting...</>
              ) : (
                <><Wrench size={20} /> Submit Service Request</>
              )}
            </button>
          </form>
        </div>
      </div>
    </PublicLayout>
  );
};

export default BookServicePage;
