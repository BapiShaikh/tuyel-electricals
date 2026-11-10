import { Link } from 'react-router-dom';
import { Zap, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const Footer = () => {
  const { settings } = useSettings();
  
  return (
    <footer className="bg-navy-900 text-gray-300">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-electric-600 rounded-xl flex items-center justify-center">
                <Zap className="text-yellow-400" size={22} />
              </div>
              <div>
                <div className="font-display font-bold text-white text-lg leading-tight">TUYEL</div>
                <div className="text-xs text-electric-400 font-semibold tracking-widest -mt-1">ELECTRICALS</div>
              </div>
            </Link>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">{settings.shop_tagline}</p>
            <p className="text-xs text-gray-500">Owned by <span className="text-white font-medium">Tuyel Sk</span></p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { to: '/shop', label: 'Shop Products' },
                { to: '/services', label: 'Our Services' },
                { to: '/book-service', label: 'Book a Service' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact Us' },
                { to: '/track-booking', label: 'Track Booking' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm hover:text-electric-400 transition-colors flex items-center gap-1">
                    <span className="text-electric-500">›</span> {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-wider">Our Services</h3>
            <ul className="space-y-2">
              {[
                'Home Electrical Wiring',
                'Fan Repair & Installation',
                'Motor & Pump Repair',
                'Refrigerator Repair',
                'Electrical Troubleshooting',
                'MCB Installation',
              ].map(service => (
                <li key={service}>
                  <Link to="/services" className="text-sm hover:text-electric-400 transition-colors flex items-center gap-1">
                    <span className="text-orange-500">⚡</span> {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-electric-400 mt-0.5 shrink-0" />
                <span className="text-sm">{settings.shop_address}</span>
              </li>
              <li>
                <a href={`tel:${settings.shop_phone}`} className="flex items-center gap-2 text-sm hover:text-electric-400 transition-colors">
                  <Phone size={16} className="text-electric-400" />
                  {settings.shop_phone}
                </a>
              </li>
              {settings.shop_email && (
                <li>
                  <a href={`mailto:${settings.shop_email}`} className="flex items-center gap-2 text-sm hover:text-electric-400 transition-colors">
                    <Mail size={16} className="text-electric-400" />
                    {settings.shop_email}
                  </a>
                </li>
              )}
              <li>
                <a
                  href={`https://wa.me/${settings.whatsapp_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors"
                >
                  <MessageCircle size={16} />
                  WhatsApp Us
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-navy-800">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} TUYEL ELECTRICALS. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Admin</Link>
            <span className="text-gray-700">|</span>
            <span className="text-xs text-gray-600">Made with ⚡ in West Bengal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

