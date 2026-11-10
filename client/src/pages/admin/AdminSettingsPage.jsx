import { useState, useEffect } from 'react';
import { Save, Settings } from 'lucide-react';
import { settingsAPI } from '../../services/api';
import AdminLayout from '../../layouts/AdminLayout';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await settingsAPI.getAll();
        const obj = {};
        data.data.forEach(s => obj[s.setting_key] = s.setting_value || '');
        setSettings(obj);
      } catch {}
      finally { setLoading(false); }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsAPI.update(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { alert('Failed to save settings'); }
    finally { setSaving(false); }
  };

  const Field = ({ label, name, type = 'text', placeholder, hint }) => (
    <div>
      <label className="label">{label}</label>
      {type === 'textarea' ? (
        <textarea value={settings[name] || ''} onChange={e => setSettings(s => ({ ...s, [name]: e.target.value }))} rows={2} placeholder={placeholder} className="input-field resize-none" />
      ) : (
        <input type={type} value={settings[name] || ''} onChange={e => setSettings(s => ({ ...s, [name]: e.target.value }))} placeholder={placeholder} className="input-field" />
      )}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );

  if (loading) return <AdminLayout title="Settings"><div className="flex justify-center py-16"><div className="spinner w-10 h-10" /></div></AdminLayout>;

  return (
    <AdminLayout title="Website Settings">
      <form onSubmit={handleSave}>
        <div className="space-y-6">
          {/* General Settings */}
          <div className="card p-6">
            <h2 className="font-display font-bold text-lg text-navy-900 mb-5 flex items-center gap-2"><Settings size={20} /> General Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Shop Name" name="shop_name" placeholder="TUYEL ELECTRICALS" />
              <Field label="Shop Tagline" name="shop_tagline" placeholder="Your Trusted Partner..." />
              <Field label="Phone Number" name="shop_phone" placeholder="+91 98765 43210" />
              <Field label="WhatsApp Number (with country code)" name="whatsapp_number" placeholder="916294156854" hint="e.g. 916294156854 (no + or spaces)" />
              <Field label="Email Address" name="shop_email" type="email" placeholder="tuyel@gmail.com" />
              <Field label="PIN Code" name="shop_pin" placeholder="700001" />
              <div className="md:col-span-2">
                <Field label="Shop Address" name="shop_address" type="textarea" placeholder="Full shop address" />
              </div>
              <Field label="Village / Area" name="shop_village" placeholder="Sherpur name" />
              <Field label="Google Maps URL" name="google_maps_url" placeholder="https://maps.google.com/..." />
            </div>
          </div>

          {/* Announcement */}
          <div className="card p-6">
            <h2 className="font-display font-bold text-lg text-navy-900 mb-5">📢 Announcement Bar</h2>
            <div className="space-y-4">
              <Field label="Announcement Text" name="announcement_text" type="textarea" placeholder="🎉 Special offer or announcement..." />
              <div>
                <label className="label">Show Announcement Bar</label>
                <div className="flex gap-4">
                  {[['1', 'Show'], ['0', 'Hide']].map(([val, label]) => (
                    <label key={val} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="announcement_active" value={val} checked={settings.announcement_active === val} onChange={e => setSettings(s => ({ ...s, announcement_active: val }))} className="accent-electric-600" />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Settings */}
          <div className="card p-6">
            <h2 className="font-display font-bold text-lg text-navy-900 mb-5">💳 Payment Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Cash on Delivery</label>
                <div className="flex gap-4">
                  {[['1', 'Enabled'], ['0', 'Disabled']].map(([val, label]) => (
                    <label key={val} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value={val} checked={settings.cod_enabled === val} onChange={() => setSettings(s => ({ ...s, cod_enabled: val }))} className="accent-electric-600" />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">UPI Payment</label>
                <div className="flex gap-4">
                  {[['1', 'Enabled'], ['0', 'Disabled']].map(([val, label]) => (
                    <label key={val} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value={val} checked={settings.upi_enabled === val} onChange={() => setSettings(s => ({ ...s, upi_enabled: val }))} className="accent-electric-600" />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Field label="UPI ID" name="upi_id" placeholder="yourname@upi" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button type="submit" disabled={saving} className="btn-primary py-3 px-8">
              <Save size={18} /> {saving ? 'Saving...' : 'Save All Settings'}
            </button>
            {saved && <span className="text-green-600 font-medium text-sm">✓ Settings saved successfully!</span>}
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminSettingsPage;

