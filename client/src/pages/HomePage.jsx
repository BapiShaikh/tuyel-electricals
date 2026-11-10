import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Wrench, Star, Phone, MapPin, CheckCircle, Clock, Shield, Award, ChevronRight, MessageCircle } from 'lucide-react';
import { productAPI, serviceAPI, settingsAPI } from '../services/api';
import { formatCurrency, getImageUrl } from '../utils/helpers';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';
import PublicLayout from '../layouts/PublicLayout';
import ProductCard from '../components/products/ProductCard';

// Hero Section
const Hero = ({ settings }) => (
  <section className="hero-gradient text-white relative overflow-hidden">
    {/* Background pattern */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-electric-400 filter blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-brand-orange filter blur-3xl"></div>
    </div>
    
    <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative z-10">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6 text-sm font-medium">
          <Zap size={14} className="text-yellow-400" />
          <span>Trusted Electrical Experts Since 2010</span>
        </div>
        
        <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
          Complete Electrical Solutions
          <span className="block text-yellow-400 mt-1">for Your Home & Business</span>
        </h1>
        
        <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
          Shop quality electrical products and get reliable repair and installation services at one place.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link to="/shop" className="btn-primary text-lg px-8 py-4 bg-white text-navy-900 hover:bg-gray-100 shadow-xl">
            <Zap size={20} />
            Explore Products
          </Link>
          <Link to="/book-service" className="btn-orange text-lg px-8 py-4 shadow-xl">
            <Wrench size={20} />
            Book a Service
          </Link>
          <a
            href={`https://wa.me/${settings.whatsapp_number}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg text-lg shadow-xl transition-all"
          >
            <MessageCircle size={20} />
            WhatsApp
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '500+', label: 'Products' },
            { value: '1000+', label: 'Happy Customers' },
            { value: '15+', label: 'Years Experience' },
            { value: '24/7', label: 'Support' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4">
              <div className="text-2xl md:text-3xl font-bold text-yellow-400">{stat.value}</div>
              <div className="text-sm text-blue-200 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// Category Grid
const CategoryGrid = () => {
  const categories = [
    { name: 'LED Lights', slug: 'led-lights', icon: '💡', color: 'bg-yellow-50 border-yellow-200' },
    { name: 'Ceiling Fans', slug: 'ceiling-fans', icon: '🌀', color: 'bg-blue-50 border-blue-200' },
    { name: 'Wires & Cables', slug: 'wires-cables', icon: '🔌', color: 'bg-red-50 border-red-200' },
    { name: 'Switches', slug: 'switches-sockets', icon: '🔲', color: 'bg-gray-50 border-gray-200' },
    { name: 'MCB / Breakers', slug: 'mcb-circuit-breakers', icon: '⚡', color: 'bg-orange-50 border-orange-200' },
    { name: 'Water Pumps', slug: 'water-pumps', icon: '💧', color: 'bg-cyan-50 border-cyan-200' },
    { name: 'Inverters', slug: 'inverters', icon: '🔋', color: 'bg-green-50 border-green-200' },
    { name: 'Refrigerators', slug: 'refrigerators', icon: '🧊', color: 'bg-indigo-50 border-indigo-200' },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="section-title">Popular Categories</h2>
          <p className="section-subtitle mx-auto">Browse our wide range of electrical products by category</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map(cat => (
            <Link
              key={cat.slug}
              to={`/shop?category=${cat.slug}`}
              className={`card p-4 text-center border-2 ${cat.color} hover:-translate-y-1 hover:shadow-lg transition-all duration-200 group`}
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</div>
              <div className="text-xs font-semibold text-gray-700 leading-tight">{cat.name}</div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/shop" className="btn-outline">
            View All Products <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

// Services Section
const ServicesSection = () => {
  const [services, setServices] = useState([]);
  const serviceHighlights = [
    { icon: '🏠', title: 'Home Electrical Services', desc: 'Complete home wiring, installation and fault troubleshooting', slug: 'home-electrical', color: 'from-navy-900 to-navy-700' },
    { icon: '🌀', title: 'Fan Repair Services', desc: 'Ceiling, table and exhaust fan repair and motor winding', slug: 'fan-repair', color: 'from-electric-600 to-electric-800' },
    { icon: '⚙️', title: 'Motor Repair Services', desc: 'Water motor, pump repair, installation and maintenance', slug: 'motor-repair', color: 'from-orange-500 to-orange-700' },
    { icon: '🧊', title: 'Refrigerator Repair', desc: 'Cooling problems, compressor service and general repair', slug: 'refrigerator-repair', color: 'from-cyan-600 to-cyan-800' },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="section-title">Our Electrical Services</h2>
          <p className="section-subtitle mx-auto">Professional repair, installation and maintenance services at your doorstep</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {serviceHighlights.map(service => (
            <Link
              key={service.slug}
              to={`/services?category=${service.slug}`}
              className={`bg-gradient-to-br ${service.color} rounded-2xl p-6 text-white hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group`}
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{service.icon}</div>
              <h3 className="font-display font-bold text-lg mb-2">{service.title}</h3>
              <p className="text-sm opacity-80 leading-relaxed">{service.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold opacity-90">
                View Services <ChevronRight size={14} />
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/book-service" className="btn-orange">
            <Wrench size={18} />
            Book a Service Now
          </Link>
        </div>
      </div>
    </section>
  );
};

// Why Choose Us
const WhyChooseUs = () => {
  const reasons = [
    { icon: <Shield className="text-electric-500" size={28} />, title: 'Licensed & Trusted', desc: 'Certified electrical professionals with years of hands-on experience.' },
    { icon: <Clock className="text-orange-500" size={28} />, title: 'Fast Response', desc: 'Same-day service available for urgent electrical repairs.' },
    { icon: <Award className="text-yellow-500" size={28} />, title: 'Quality Products', desc: 'We stock only genuine branded products with manufacturer warranties.' },
    { icon: <CheckCircle className="text-green-500" size={28} />, title: 'Affordable Pricing', desc: 'Transparent pricing with no hidden charges. Get a quote first.' },
    { icon: <MapPin className="text-red-500" size={28} />, title: 'Local Service', desc: 'Serving Sherpur and nearby areas with doorstep service.' },
    { icon: <Star className="text-purple-500" size={28} />, title: '1000+ Happy Customers', desc: 'Trusted by homes and businesses across the region.' },
  ];

  return (
    <section className="py-16 bg-navy-900 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-3">Why Choose TUYEL ELECTRICALS?</h2>
          <p className="text-blue-200 text-lg">Your trusted partner for all electrical needs</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map(reason => (
            <div key={reason.title} className="bg-navy-800 rounded-xl p-6 border border-navy-700 hover:border-electric-600 transition-colors">
              <div className="w-12 h-12 bg-navy-700 rounded-xl flex items-center justify-center mb-4">
                {reason.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">{reason.title}</h3>
              <p className="text-blue-200 text-sm leading-relaxed">{reason.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// How It Works
const HowItWorks = () => (
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-4">
      <div className="text-center mb-10">
        <h2 className="section-title">How Our Service Works</h2>
        <p className="section-subtitle mx-auto">Simple 4-step process to get your electrical work done</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { step: '01', title: 'Book a Service', desc: 'Fill our online form or WhatsApp us with your service requirement.', icon: '📋' },
          { step: '02', title: 'Confirmation', desc: 'Our team reviews your request and confirms the appointment.', icon: '✅' },
          { step: '03', title: 'Technician Visit', desc: 'Our certified technician visits at your preferred time slot.', icon: '👷' },
          { step: '04', title: 'Problem Solved!', desc: 'Work completed professionally. Pay only after you are satisfied.', icon: '🎉' },
        ].map(step => (
          <div key={step.step} className="relative">
            <div className="card p-6 text-center">
              <div className="text-4xl mb-3">{step.icon}</div>
              <div className="text-xs font-bold text-electric-500 mb-2 tracking-wider">STEP {step.step}</div>
              <h3 className="font-display font-bold text-navy-900 text-lg mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm">{step.desc}</p>
            </div>
            {/* Arrow connector - only for non-last items on large screens */}
          </div>
        ))}
      </div>
      <div className="text-center mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/book-service" className="btn-secondary">
          <Wrench size={18} /> Book Service Online
        </Link>
        <a href="https://wa.me/916294156854?text=Hi%20TUYEL%20ELECTRICALS!%20I%20need%20to%20book%20a%20service."
          target="_blank" rel="noopener noreferrer"
          className="btn-primary bg-green-500 hover:bg-green-600"
        >
          <MessageCircle size={18} /> WhatsApp: 6294 156854
        </a>
      </div>
    </div>
  </section>
);

// Reviews Section
const ReviewsSection = () => {
  const reviews = [
    { name: 'Ramesh Mondal', village: 'Sherpur', rating: 5, text: 'Excellent service! Tuyel bhai fixed my water motor within 2 hours. Very professional and affordable pricing.' },
    { name: 'Saira Begum', village: 'Near Primary School, Sherpur', rating: 5, text: 'Bought a ceiling fan from TUYEL ELECTRICALS. Great quality product at the best price. Friendly behavior.' },
    { name: 'Bikash Ghosh', village: 'Sherpur', rating: 5, text: 'My refrigerator stopped cooling. They came the same day and repaired the compressor perfectly. Highly recommend!' },
    { name: 'Pranab Das', village: 'Nearby Village', rating: 5, text: 'Complete home wiring done by Tuyel Electricals team. Very clean work, all genuine branded Havells & Polycab wires used.' },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="section-title">What Our Customers Say</h2>
          <div className="flex items-center justify-center gap-1 mt-3">
            {[...Array(5)].map((_, i) => <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />)}
            <span className="text-gray-600 ml-2 font-medium">4.9/5 Rating in Sherpur</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map(review => (
            <div key={review.name} className="card p-6">
              <div className="flex mb-3">
                {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />)}
              </div>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed italic">"{review.text}"</p>
              <div>
                <div className="font-semibold text-navy-900">{review.name}</div>
                <div className="text-xs text-gray-500">📍 {review.village}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Contact CTA
const ContactCTA = ({ settings }) => (
  <section className="py-16 bg-electric-600 text-white relative overflow-hidden">
    <div className="container mx-auto px-4 text-center relative z-10">
      <h2 className="font-display font-bold text-3xl md:text-4xl mb-3">Ready to Get Started?</h2>
      <p className="text-blue-100 text-lg mb-4 max-w-xl mx-auto">
        Visit our shop or contact us for any electrical product or service requirement.
      </p>
      <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-white/15 backdrop-blur px-5 py-2.5 rounded-full text-sm font-medium mb-8 text-blue-50 border border-white/20">
        <MapPin size={16} className="text-yellow-400" />
        <span>Vill- Sherpur (Near Primary School), West Bengal</span>
        <span className="opacity-50">|</span>
        <Phone size={16} className="text-yellow-400" />
        <span>+91 6294 156854</span>
      </div>
      <div className="flex flex-wrap gap-4 justify-center">
        <a href={`tel:${settings.shop_phone || '+916294156854'}`} className="btn-primary bg-white text-electric-700 hover:bg-gray-100 shadow-lg">
          <Phone size={18} />
          Call: 6294 156854
        </a>
        <a href={`https://wa.me/${settings.whatsapp_number || '916294156854'}`} target="_blank" rel="noopener noreferrer"
          className="btn-primary bg-green-500 hover:bg-green-600 shadow-lg">
          <MessageCircle size={18} />
          WhatsApp: 6294 156854
        </a>
        <Link to="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-electric-700">
          <MapPin size={18} />
          Visit Shop in Sherpur
        </Link>
      </div>
    </div>
  </section>
);

// Main HomePage
const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, bestRes] = await Promise.all([
          productAPI.getAll({ featured: 'true', limit: 8 }),
          productAPI.getAll({ bestseller: 'true', limit: 8 }),
        ]);
        setFeaturedProducts(featuredRes.data.data || []);
        setBestSellers(bestRes.data.data || []);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <PublicLayout>
      <Hero settings={settings} />
      <CategoryGrid />
      
      {/* Featured Products */}
      {(loading || featuredProducts.length > 0) && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="section-title">Featured Products</h2>
                <p className="text-gray-500 mt-1">Handpicked products for you</p>
              </div>
              <Link to="/shop?featured=true" className="btn-outline hidden sm:flex">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="card overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {featuredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
            <div className="text-center mt-6 sm:hidden">
              <Link to="/shop" className="btn-outline">View All Products</Link>
            </div>
          </div>
        </section>
      )}

      <ServicesSection />
      <WhyChooseUs />

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="section-title">Best-Selling Products</h2>
                <p className="text-gray-500 mt-1">Our customers love these</p>
              </div>
              <Link to="/shop?bestseller=true" className="btn-outline hidden sm:flex">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {bestSellers.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <HowItWorks />
      <ReviewsSection />
      <ContactCTA settings={settings} />
    </PublicLayout>
  );
};

export default HomePage;

