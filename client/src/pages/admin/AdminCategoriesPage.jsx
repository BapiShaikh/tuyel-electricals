import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { categoryAPI } from '../../services/api';
import AdminLayout from '../../layouts/AdminLayout';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', parent_id: '', sort_order: '0', is_active: true });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await categoryAPI.getAll();
      setCategories(data.flat || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => { setEditCat(null); setForm({ name: '', description: '', parent_id: '', sort_order: '0', is_active: true }); setShowModal(true); };
  const openEdit = (cat) => { setEditCat(cat); setForm({ name: cat.name, description: cat.description || '', parent_id: cat.parent_id || '', sort_order: cat.sort_order || '0', is_active: cat.is_active !== 0 }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editCat) await categoryAPI.update(editCat.id, form);
      else await categoryAPI.create(form);
      setShowModal(false);
      fetchCategories();
    } catch (err) { alert(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try { await categoryAPI.delete(id); fetchCategories(); } catch {}
  };

  const parentCats = categories.filter(c => !c.parent_id);

  return (
    <AdminLayout title="Categories">
      <div className="flex justify-between mb-6">
        <span className="text-sm text-gray-500">{categories.length} categories</span>
        <button onClick={openAdd} className="btn-primary py-2 text-sm"><Plus size={16} /> Add Category</button>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Name', 'Parent', 'Products', 'Order', 'Status', 'Actions'].map(h => (
              <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? [...Array(6)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={6} className="px-4 py-4"><div className="h-4 bg-gray-200 rounded" /></td></tr>)
            : categories.map(cat => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-navy-900">{cat.parent_id ? <span className="text-gray-400 mr-1">└</span> : ''}{cat.name}</td>
                <td className="px-4 py-3 text-gray-500">{cat.parent_name || '-'}</td>
                <td className="px-4 py-3">{cat.product_count || 0}</td>
                <td className="px-4 py-3">{cat.sort_order}</td>
                <td className="px-4 py-3"><span className={`badge ${cat.is_active ? 'badge-green' : 'badge-red'}`}>{cat.is_active ? 'Active' : 'Inactive'}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(cat)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(cat.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-display font-bold text-xl">{editCat ? 'Edit' : 'Add'} Category</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="label">Category Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="label">Parent Category (leave empty for top-level)</label>
                <select value={form.parent_id} onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))} className="input-field">
                  <option value="">None (Top Level)</option>
                  {parentCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="input-field resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Sort Order</label>
                  <input type="number" min="0" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} className="input-field" />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-electric-600" />
                    <span className="text-sm font-medium">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving ? 'Saving...' : editCat ? 'Update' : 'Add'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1 border border-gray-200 justify-center">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCategoriesPage;

