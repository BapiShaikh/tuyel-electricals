import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Wrench, ChevronRight, MessageCircle, Clock, IndianRupee, ArrowRight } from 'lucide-react';
import { serviceAPI } from '../services/api';
import { formatCurrency, getImageUrl } from '../utils/helpers';
import { useSettings } from '../context/SettingsContext';
import PublicLayout from '../layouts/PublicLayout';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [grouped, setGrouped] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const { settings } = useSettings();
  const categoryFilter = searchParams.get('category') || '';

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const params = {};
        if (categoryFilter) params.category = categoryFilter;
        const { data } = await serviceAPI.getAll(params);
        setServices(data.data || []);
        setGrouped(data.grouped || []);
      } catch {}
      finally { setLoading(false); }
    };
    fetchServices();
  }, [categoryFilter]);

  const ServiceCard = ({ service }) => (
    <div className="card overflow-hidden group hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-48 bg-gradient-to-br from-navy-900 to-electric-700 overflow-hidden">
        <img
          src={getImageUrl(service.image_path, `${service.name} ${service.category_name || ''} service`)}
          alt={service.name}
          className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/40 to-transparent p-4 flex flex-col justify-end">
          <h3 className="font-display font-bold text-white text-lg leading-tight">{service.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs bg-electric-500/80 text-white px-2 py-0.5 rounded-full font-medium">{service.category_name}</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{service.short_description}</p>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-1 text-navy-900 font-bold text-lg">
              <span>Starting</span> <IndianRupee size={16} /><span>{service.starting_price}</span>
            </div>
            <div className="text-xs text-gray-400">{service.price_note}</div>
          </div>
          {service.duration_estimate && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={12} />{service.duration_estimate}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Link to={`/book-service?service=${service.id}&category=${service.category_id}`} className="btn-primary flex-1 justify-center py-2 text-sm">
            Book Now
          </Link>
          <a
            href={`https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(`Hi! I need *${service.name}* service. Please provide more information.`)}`}
            target="_blank" rel="noopener noreferrer"
            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
          >
            <MessageCircle size={18} />
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <PublicLayout>
      {/* Header */}
      <div className="bg-navy-900 text-white py-10">
        <div className="container mx-auto px-4">
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">Our Electrical Services</h1>
          <p className="text-blue-200">Professional repair, installation and maintenance at your doorstep</p>
          <div className="flex items-center gap-2 text-sm text-blue-300 mt-3">
            <Link to="/" className="hover:text-white">Home</Link>
            <ChevronRight size={14} /><span>Services</span>
          </div>
        </div>
      </div>

      {/* Service CTA Banner */}
      <div className="bg-brand-orange text-white py-4">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-semibold">🏠 Free home visit for diagnosis! Book now.</p>
          <Link to="/book-service" className="btn-primary bg-white text-brand-orange hover:bg-gray-100 py-2 text-sm">
            Book a Service <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Category Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link to="/services" className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!categoryFilter ? 'bg-navy-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
            All Services
          </Link>
          {grouped.map(cat => (
            <Link key={cat.slug} to={`/services?category=${cat.slug}`} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${categoryFilter === cat.slug ? 'bg-navy-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
              {cat.name} ({cat.services.length})
            </Link>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-44 bg-gray-200 rounded-t-2xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No services found</p>
          </div>
        ) : (
          grouped.map(cat => (
            <div key={cat.id} className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display font-bold text-2xl text-navy-900">{cat.name}</h2>
                  <p className="text-gray-500 text-sm mt-1">{cat.services.length} services available</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cat.services.map(service => <ServiceCard key={service.id} service={service} />)}
              </div>
            </div>
          ))
        )}
      </div>
    </PublicLayout>
  );
};

export default ServicesPage;
