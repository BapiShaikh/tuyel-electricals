import { Link } from 'react-router-dom';
import { Award, Users, Clock, MapPin, Phone, Zap, Shield, Star } from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';

const AboutPage = () => (
  <PublicLayout>
    <div className="bg-navy-900 text-white py-12">
      <div className="container mx-auto px-4 text-center">
        <h1 className="font-display font-bold text-4xl mb-3">About TUYEL ELECTRICALS</h1>
        <p className="text-blue-200 text-lg max-w-2xl mx-auto">Your trusted partner for electrical products and services since 2010</p>
      </div>
    </div>

    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-electric-50 text-electric-700 text-sm font-semibold mb-4">
              <Zap size={14} /> Our Story
            </div>
            <h2 className="font-display font-bold text-3xl text-navy-900 mb-4">Powering Homes & Businesses Since 2010</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">TUYEL ELECTRICALS was founded by <strong>Tuyel Sk</strong> with a simple vision: to provide high-quality electrical products and expert repair services to every home and business in the region.</p>
            <p className="text-gray-600 mb-4 leading-relaxed">Starting as a small electrical repair shop, we've grown into a full-service electrical business offering a wide range of branded products, fan repairs, motor repairs, home wiring, and refrigerator services.</p>
            <p className="text-gray-600 leading-relaxed">Our commitment to quality, transparency, and customer satisfaction has made us the most trusted electrical shop in the area.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <Award className="text-yellow-500" size={28} />, value: '15+', label: 'Years Experience' },
              { icon: <Users className="text-blue-500" size={28} />, value: '1000+', label: 'Happy Customers' },
              { icon: <Zap className="text-orange-500" size={28} />, value: '500+', label: 'Products in Stock' },
              { icon: <Star className="text-green-500" size={28} />, value: '4.9★', label: 'Customer Rating' },
            ].map(stat => (
              <div key={stat.label} className="card p-6 text-center">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">{stat.icon}</div>
                <div className="font-display font-bold text-2xl text-navy-900">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="font-display font-bold text-3xl text-navy-900 text-center mb-10">What We Offer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: '🏪', title: 'Product Sales', desc: 'Genuine branded electrical products including fans, wires, switches, MCBs, lights and home appliances.' },
            { icon: '🔧', title: 'Repair Services', desc: 'Expert repair for fans, motors, water pumps and refrigerators with warranty on repair work.' },
            { icon: '🏠', title: 'Home Wiring', desc: 'Complete home electrical wiring, installation and troubleshooting by certified electricians.' },
            { icon: '📦', title: 'Home Delivery', desc: 'Convenient delivery for products to your doorstep in nearby villages and towns.' },
          ].map(item => (
            <div key={item.title} className="card p-6 text-center">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-display font-bold text-navy-900 text-lg mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="py-16 bg-electric-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-display font-bold text-3xl mb-4">Ready to Work With Us?</h2>
        <p className="text-blue-100 mb-8 max-w-lg mx-auto">Visit our shop or book a service online. We're here to help with all your electrical needs.</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/book-service" className="btn-primary bg-white text-electric-700 hover:bg-gray-100">Book a Service</Link>
          <Link to="/shop" className="btn-outline border-white text-white hover:bg-white hover:text-electric-700">Shop Products</Link>
          <Link to="/contact" className="btn-primary bg-green-500 hover:bg-green-600">Contact Us</Link>
        </div>
      </div>
    </section>
  </PublicLayout>
);

export default AboutPage;

