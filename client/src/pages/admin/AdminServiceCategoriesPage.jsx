import { useState, useEffect } from 'react';
import { serviceAPI } from '../../services/api';
import AdminLayout from '../../layouts/AdminLayout';

const AdminServiceCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await serviceAPI.getCategories();
        setCategories(data.data || []);
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const icons = { Zap: '⚡', Wind: '🌀', Settings: '⚙️', Thermometer: '🌡️' };

  return (
    <AdminLayout title="Service Categories">
      <div className="mb-6">
        <p className="text-sm text-gray-500">Service categories are configured in the system with icons and routing.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? [...Array(4)].map((_, i) => <div key={i} className="card p-6 animate-pulse h-32" />) :
        categories.map(cat => (
          <div key={cat.id} className="card p-6">
            <div className="text-3xl mb-3">{icons[cat.icon] || '⚡'}</div>
            <h3 className="font-display font-bold text-navy-900 mb-1">{cat.name}</h3>
            <p className="text-sm text-gray-500 mb-3">{cat.description}</p>
            <div className="text-sm font-semibold text-electric-600">{cat.service_count} services</div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminServiceCategoriesPage;

