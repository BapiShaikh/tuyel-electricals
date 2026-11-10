import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, Phone, Zap, MessageCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import SearchModal from './SearchModal';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartCount } = useCart();
  const { settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop Products' },
    { to: '/services', label: 'Our Services' },
    { to: '/book-service', label: 'Book a Service' },
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact Us' },
  ];

  return (
    <>
      {/* Announcement Bar */}
      {settings.announcement_active === '1' && (
        <div className="announcement-bar text-white text-center py-2 text-sm font-medium px-4">
          {settings.announcement_text}
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-navy-900 text-gray-300 py-1.5 hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center text-xs">
          <span>📍 {settings.shop_address}</span>
          <div className="flex items-center gap-4">
            <a href={`tel:${settings.shop_phone}`} className="flex items-center gap-1 hover:text-white transition-colors">
              <Phone size={12} />
              {settings.shop_phone}
            </a>
            <a
              href={`https://wa.me/${settings.whatsapp_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
            >
              <MessageCircle size={12} />
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg' : 'bg-white'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-navy-900 rounded-xl flex items-center justify-center group-hover:bg-electric-600 transition-colors">
                <Zap className="text-yellow-400" size={22} />
              </div>
              <div>
                <div className="font-display font-bold text-navy-900 text-lg leading-tight">TUYEL</div>
                <div className="text-xs text-electric-600 font-semibold tracking-widest -mt-1">ELECTRICALS</div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive ? 'text-electric-600 bg-electric-50' : 'text-gray-700 hover:text-electric-600 hover:bg-gray-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-600 hover:text-electric-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              <Link
                to="/cart"
                className="p-2 text-gray-600 hover:text-electric-600 hover:bg-gray-100 rounded-lg transition-colors relative"
                aria-label="Cart"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-orange text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
              <a
                href={`https://wa.me/${settings.whatsapp_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex btn-primary py-2 px-4 text-sm bg-green-500 hover:bg-green-600"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-electric-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl animate-slide-up">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive ? 'text-electric-600 bg-electric-50' : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <a
                href={`https://wa.me/${settings.whatsapp_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-2 bg-green-500 hover:bg-green-600 justify-center"
              >
                <MessageCircle size={18} />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        )}
      </nav>

      {isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} />}
    </>
  );
};

export default Navbar;

