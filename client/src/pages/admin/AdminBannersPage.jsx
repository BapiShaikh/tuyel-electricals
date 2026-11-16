import { useState, useEffect } from 'react';
import {
  Sliders, Plus, Edit2, Trash2, CheckCircle, XCircle, Eye, EyeOff,
  Image as ImageIcon, ArrowUpDown, ExternalLink, Link as LinkIcon, AlertCircle
} from 'lucide-react';
import { bannerAPI } from '../../services/api';
import { getImageUrl } from '../../utils/helpers';
import AdminLayout from '../../layouts/AdminLayout';

const AdminBannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    button_text: 'Explore Products',
    button_link: '/shop',
    sort_order: 1,
    is_active: 1,
    image_url: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await bannerAPI.getAllAdmin();
      setBanners(res.data.data || []);
    } catch (err) {
      console.error('Failed to load banners:', err);
      showToast('Error loading banners from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      button_text: 'Explore Products',
      button_link: '/shop',
      sort_order: banners.length + 1,
      is_active: 1,
      image_url: '',
    });
    setImageFile(null);
    setPreviewUrl('');
    setModalOpen(true);
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      button_text: banner.button_text || 'Explore Products',
      button_link: banner.button_link || '/shop',
      sort_order: banner.sort_order ?? 1,
      is_active: banner.is_active ? 1 : 0,
      image_url: banner.image_path?.startsWith('http') ? banner.image_path : '',
    });
    setImageFile(null);
    setPreviewUrl(banner.image_path ? getImageUrl(banner.image_path) : '');
    setModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, image_url: '' }));
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, image_url: url }));
    if (url.trim()) {
      setImageFile(null);
      setPreviewUrl(url.trim());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a banner title.');
      return;
    }

    try {
      setSaving(true);
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('subtitle', formData.subtitle.trim());
      data.append('button_text', formData.button_text.trim());
      data.append('button_link', formData.button_link.trim());
      data.append('sort_order', formData.sort_order);
      data.append('is_active', formData.is_active);

      if (imageFile) {
        data.append('image', imageFile);
      } else if (formData.image_url) {
        data.append('image_url', formData.image_url.trim());
      }

      if (editingBanner) {
        await bannerAPI.update(editingBanner.id, data);
        showToast('Banner slide updated successfully! ✨');
      } else {
        await bannerAPI.create(data);
        showToast('New banner slide added successfully! 🎉');
      }

      setModalOpen(false);
      fetchBanners();
    } catch (err) {
      console.error('Error saving banner:', err);
      alert('Failed to save banner: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      const updatedActive = banner.is_active ? 0 : 1;
      const data = new FormData();
      data.append('title', banner.title || '');
      data.append('subtitle', banner.subtitle || '');
      data.append('button_text', banner.button_text || '');
      data.append('button_link', banner.button_link || '');
      data.append('sort_order', banner.sort_order);
      data.append('is_active', updatedActive);
      if (banner.image_path) {
        data.append('image_url', banner.image_path);
      }

      await bannerAPI.update(banner.id, data);
      showToast(`Slide "${banner.title?.slice(0, 20)}..." marked ${updatedActive ? 'Active' : 'Inactive'}`);
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, is_active: updatedActive } : b))
      );
    } catch (err) {
      console.error('Error updating status:', err);
      showToast('Failed to toggle status.');
    }
  };

  const handleDelete = async (banner) => {
    if (!window.confirm(`Are you sure you want to delete the slide: "${banner.title}"?`)) {
      return;
    }
    try {
      await bannerAPI.delete(banner.id);
      showToast('Banner deleted successfully.');
      setBanners((prev) => prev.filter((b) => b.id !== banner.id));
    } catch (err) {
      console.error('Error deleting banner:', err);
      alert('Failed to delete banner.');
    }
  };

  return (
    <AdminLayout title="Hero Slider & Banners">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-xl font-display font-bold text-navy-950 flex items-center gap-2">
              <Sliders size={22} className="text-electric-600" />
              Front Page Hero Carousel ({banners.length} slides)
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Control the rotating OwlCarousel slider images, headlines, and call-to-action buttons on the homepage.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-electric-600 hover:bg-electric-700 text-white font-semibold text-sm shadow-md transition-all hover:shadow-lg shrink-0"
          >
            <Plus size={18} />
            <span>Add New Slide</span>
          </button>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium shadow-sm animate-fade-in">
            <CheckCircle size={18} className="text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {/* Slides List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner w-10 h-10 text-electric-600" />
          </div>
        ) : banners.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <ImageIcon size={48} className="text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-navy-900 mb-1">No slides added yet</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              Create your first hero slider image to showcase products, repairs, or seasonal offers on the front page.
            </p>
            <button
              onClick={openCreateModal}
              className="btn-primary"
            >
              <Plus size={18} /> Add Your First Slide
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {banners.map((banner, index) => {
              const imgUrl = getImageUrl(banner.image_path, banner.title);
              const isActive = Boolean(banner.is_active);

              return (
                <div
                  key={banner.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md ${
                    isActive ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-70 bg-gray-50/50'
                  }`}
                >
                  <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center gap-5">
                    {/* Thumbnail */}
                    <div className="relative w-full md:w-56 h-36 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200 group">
                      <img
                        src={imgUrl}
                        alt={banner.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80';
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-navy-900/80 backdrop-blur-md text-white text-xs font-mono font-bold px-2 py-0.5 rounded">
                        Slide #{banner.sort_order || index + 1}
                      </div>
                      <div className="absolute bottom-2 right-2">
                        {isActive ? (
                          <span className="bg-emerald-600/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow">
                            Active
                          </span>
                        ) : (
                          <span className="bg-gray-600/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow">
                            Hidden
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-electric-600 bg-electric-50 border border-electric-200 px-2.5 py-0.5 rounded-full">
                          Order: {banner.sort_order || 1}
                        </span>
                        {banner.button_text && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <LinkIcon size={11} /> {banner.button_text} ({banner.button_link || '/'})
                          </span>
                        )}
                      </div>

                      <h3 className="font-display font-bold text-navy-900 text-lg mb-1 line-clamp-1">
                        {banner.title}
                      </h3>

                      {banner.subtitle && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                          {banner.subtitle}
                        </p>
                      )}

                      <div className="text-xs text-gray-400 font-mono truncate">
                        Image: {banner.image_path || 'Default'}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 w-full md:w-auto justify-end">
                      <button
                        onClick={() => handleToggleActive(banner)}
                        title={isActive ? 'Deactivate Slide' : 'Activate Slide'}
                        className={`p-2.5 rounded-xl border text-sm font-medium transition-colors flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                        <span className="text-xs hidden sm:inline">{isActive ? 'Active' : 'Hidden'}</span>
                      </button>

                      <button
                        onClick={() => openEditModal(banner)}
                        className="p-2.5 rounded-xl bg-electric-50 hover:bg-electric-100 text-electric-700 border border-electric-200 transition-colors flex items-center gap-1.5"
                        title="Edit Slide"
                      >
                        <Edit2 size={16} />
                        <span className="text-xs font-semibold hidden sm:inline">Edit</span>
                      </button>

                      <button
                        onClick={() => handleDelete(banner)}
                        className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors flex items-center gap-1.5"
                        title="Delete Slide"
                      >
                        <Trash2 size={16} />
                        <span className="text-xs font-semibold hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Add or Edit Slide */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl my-8 overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-display font-bold text-lg text-navy-900 flex items-center gap-2">
                  <Sliders size={20} className="text-electric-600" />
                  {editingBanner ? 'Edit Hero Slide' : 'Add New Hero Slide'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <XCircle size={22} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Title */}
                <div>
                  <label className="label">Slide Headline / Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Complete Electrical Solutions for Home & Business"
                    className="input-field"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="label">Subheadline / Description</label>
                  <textarea
                    rows={2}
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. Shop quality electrical products and get reliable repair services in Sherpur."
                    className="input-field resize-none"
                  />
                </div>

                {/* Image Section */}
                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-sm text-navy-900 flex items-center gap-1.5">
                      <ImageIcon size={16} className="text-electric-600" /> Slide Image (Choose either URL or Upload)
                    </label>
                  </div>

                  {/* Option 1: Direct Image URL */}
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">
                      Direct Image URL (Recommended for reliable high-speed CDN delivery)
                    </label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={handleUrlChange}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="input-field text-sm"
                    />
                  </div>

                  {/* Option 2: Upload File */}
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">
                      Or Upload Image File from your Computer (JPEG, PNG, WebP)
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleFileChange}
                      className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-electric-100 file:text-electric-700 hover:file:bg-electric-200 cursor-pointer"
                    />
                  </div>

                  {/* Live Preview */}
                  {previewUrl && (
                    <div className="mt-3">
                      <div className="text-xs font-semibold text-gray-600 mb-1">Live Image Preview:</div>
                      <div className="relative h-44 rounded-xl overflow-hidden border border-gray-300 bg-navy-950">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-3">
                          <span className="text-white text-xs font-medium truncate">
                            {formData.title || 'Slide Title Preview'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Button Text & Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Call to Action Button Text</label>
                    <input
                      type="text"
                      value={formData.button_text}
                      onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                      placeholder="e.g. Explore Products"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Button Link URL</label>
                    <input
                      type="text"
                      value={formData.button_link}
                      onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                      placeholder="e.g. /shop or /book-service"
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Sort Order & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label flex items-center gap-1.5">
                      <ArrowUpDown size={14} /> Slide Sort Order
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
                      className="input-field"
                    />
                    <p className="text-xs text-gray-400 mt-1">Lower numbers appear first in the carousel.</p>
                  </div>

                  <div>
                    <label className="label">Slide Visibility</label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="is_active"
                          checked={formData.is_active === 1}
                          onChange={() => setFormData({ ...formData, is_active: 1 })}
                          className="accent-electric-600"
                        />
                        <span className="text-sm font-medium text-emerald-700">Active (Visible)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="is_active"
                          checked={formData.is_active === 0}
                          onChange={() => setFormData({ ...formData, is_active: 0 })}
                          className="accent-electric-600"
                        />
                        <span className="text-sm font-medium text-gray-600">Hidden (Draft)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="btn-outline px-5 py-2.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary px-6 py-2.5 flex items-center gap-2"
                  >
                    {saving && <div className="spinner w-4 h-4 border-2" />}
                    <span>{editingBanner ? 'Save Changes' : 'Create Slide'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBannersPage;

