import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { brandAPI } from '../../services/api';
import AdminLayout from '../../layouts/AdminLayout';

const AdminBrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBrand, setEditBrand] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', is_active: true });

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const { data } = await brandAPI.getAll();
      setBrands(data.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBrands(); }, []);

  const openAdd = () => { setEditBrand(null); setForm({ name: '', description: '', is_active: true }); setShowModal(true); };
  const openEdit = (b) => { setEditBrand(b); setForm({ name: b.name, description: b.description || '', is_active: b.is_active !== 0 }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editBrand) await brandAPI.update(editBrand.id, form);
      else await brandAPI.create(form);
      setShowModal(false);
      fetchBrands();
    } catch (err) { alert(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this brand?')) return;
    try { await brandAPI.delete(id); fetchBrands(); } catch {}
  };

  return (
    <AdminLayout title="Brands">
      <div className="flex justify-between mb-6">
        <span className="text-sm text-gray-500">{brands.length} brands</span>
        <button onClick={openAdd} className="btn-primary py-2 text-sm"><Plus size={16} /> Add Brand</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? [...Array(8)].map((_, i) => <div key={i} className="card p-4 animate-pulse h-24" />) :
        brands.map(brand => (
          <div key={brand.id} className="card p-4 flex items-center justify-between gap-2 hover:shadow-card-hover transition-shadow">
            <div>
              <div className="font-semibold text-navy-900">{brand.name}</div>
              <div className="text-xs text-gray-500">{brand.product_count} products</div>
              <span className={`badge mt-1 ${brand.is_active ? 'badge-green' : 'badge-red'}`}>{brand.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <button onClick={() => openEdit(brand)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600"><Pencil size={14} /></button>
              <button onClick={() => handleDelete(brand.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-display font-bold text-xl">{editBrand ? 'Edit' : 'Add'} Brand</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="label">Brand Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="input-field resize-none" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-electric-600" />
                <span className="text-sm font-medium">Active</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving ? 'Saving...' : editBrand ? 'Update' : 'Add Brand'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1 border border-gray-200 justify-center">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBrandsPage;

