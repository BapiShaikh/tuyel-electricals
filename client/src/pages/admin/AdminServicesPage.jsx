import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Pencil, Trash2, Upload, X } from 'lucide-react';
import { serviceAPI } from '../../services/api';
import { formatCurrency, getImageUrl } from '../../utils/helpers';
import AdminLayout from '../../layouts/AdminLayout';

const AdminServicesPage = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editService, setEditService] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileRef = useRef();
  const [form, setForm] = useState({
    category_id: '', name: '', short_description: '', description: '',
    starting_price: '', price_note: 'Starting price, actual cost may vary',
    duration_estimate: '', is_active: true, is_featured: false, sort_order: '0'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [svcRes, catRes] = await Promise.all([serviceAPI.getAll(), serviceAPI.getCategories()]);
      setServices(svcRes.data.data || []);
      setCategories(catRes.data.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setEditService(null);
    setForm({ category_id: '', name: '', short_description: '', description: '',
      starting_price: '', price_note: 'Starting price, actual cost may vary',
      duration_estimate: '', is_active: true, is_featured: false, sort_order: '0' });
    setImagePreview(null);
    setShowModal(true);
  };

  const openEdit = (svc) => {
    setEditService(svc);
    setForm({ category_id: svc.category_id || '', name: svc.name || '', short_description: svc.short_description || '',
      description: svc.description || '', starting_price: svc.starting_price || '',
      price_note: svc.price_note || '', duration_estimate: svc.duration_estimate || '',
      is_active: svc.is_active !== 0, is_featured: !!svc.is_featured, sort_order: svc.sort_order || '0' });
    setImagePreview(svc.image_path ? getImageUrl(svc.image_path) : null);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (fileRef.current?.files[0]) fd.append('image', fileRef.current.files[0]);
      if (editService) await serviceAPI.update(editService.id, fd);
      else await serviceAPI.create(fd);
      setShowModal(false);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return;
    try { await serviceAPI.delete(id); fetchData(); } catch {}
  };

  return (
    <AdminLayout title="Services">
      <div className="flex justify-between items-center mb-6">
        <span className="text-gray-600 text-sm">{services.length} services</span>
        <button onClick={openAdd} className="btn-primary py-2 text-sm"><Plus size={16} /> Add Service</button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{['Service', 'Category', 'Starting Price', 'Duration', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? [...Array(6)].map((_, i) => (
                <tr key={i} className="animate-pulse"><td colSpan={6} className="px-4 py-4"><div className="h-4 bg-gray-200 rounded" /></td></tr>
              )) : services.map(svc => (
                <tr key={svc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        {svc.image_path ? <img src={getImageUrl(svc.image_path)} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">🔧</div>}
                      </div>
                      <div>
                        <div className="font-medium text-navy-900">{svc.name}</div>
                        {svc.is_featured && <span className="badge badge-blue text-xs">Featured</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{svc.category_name}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(svc.starting_price)}</td>
                  <td className="px-4 py-3 text-gray-500">{svc.duration_estimate || '-'}</td>
                  <td className="px-4 py-3"><span className={`badge ${svc.is_active ? 'badge-green' : 'badge-red'}`}>{svc.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(svc)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600"><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(svc.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-start justify-center p-4 pt-10">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-display font-bold text-xl text-navy-900">{editService ? 'Edit Service' : 'Add Service'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 max-h-[75vh] overflow-y-auto space-y-4">
              <div>
                <label className="label">Category *</label>
                <select required value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="input-field">
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Service Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="label">Short Description</label>
                <input type="text" value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} className="input-field" maxLength={500} />
              </div>
              <div>
                <label className="label">Full Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="input-field resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Starting Price ₹ *</label>
                  <input type="number" required min="0" step="0.01" value={form.starting_price} onChange={e => setForm(f => ({ ...f, starting_price: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="label">Duration Estimate</label>
                  <input type="text" value={form.duration_estimate} onChange={e => setForm(f => ({ ...f, duration_estimate: e.target.value }))} placeholder="e.g. 1-2 hours" className="input-field" />
                </div>
              </div>
              <div>
                <label className="label">Price Note</label>
                <input type="text" value={form.price_note} onChange={e => setForm(f => ({ ...f, price_note: e.target.value }))} className="input-field" />
              </div>
              <div className="flex gap-4">
                {[['is_active', 'Active'], ['is_featured', 'Featured']].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} className="w-4 h-4 accent-electric-600" />
                    <span className="text-sm font-medium">{label}</span>
                  </label>
                ))}
              </div>
              <div>
                <label className="label">Service Image</label>
                {imagePreview && <img src={imagePreview} alt="" className="w-24 h-24 object-cover rounded-xl mb-2 border" />}
                <label className="flex items-center gap-3 p-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-electric-400 transition-colors">
                  <Upload size={18} className="text-gray-400" /><span className="text-sm text-gray-500">Upload image</span>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving ? 'Saving...' : editService ? 'Update' : 'Add Service'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1 border border-gray-200 justify-center">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminServicesPage;

