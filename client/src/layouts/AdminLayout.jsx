import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tags, Building2, Wrench, FolderOpen, ClipboardList,
  ShoppingBag, Users, Warehouse, Settings, LogOut, Menu, X, Zap, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navGroups = [
    {
      label: 'Main',
      items: [
        { to: '/admin', icon: <LayoutDashboard size={18} />, label: 'Dashboard', end: true },
      ]
    },
    {
      label: 'Products',
      items: [
        { to: '/admin/products', icon: <Package size={18} />, label: 'Products' },
        { to: '/admin/categories', icon: <Tags size={18} />, label: 'Categories' },
        { to: '/admin/brands', icon: <Building2 size={18} />, label: 'Brands' },
        { to: '/admin/inventory', icon: <Warehouse size={18} />, label: 'Inventory' },
      ]
    },
    {
      label: 'Services',
      items: [
        { to: '/admin/services', icon: <Wrench size={18} />, label: 'Services' },
        { to: '/admin/service-categories', icon: <FolderOpen size={18} />, label: 'Service Categories' },
        { to: '/admin/bookings', icon: <ClipboardList size={18} />, label: 'Service Bookings' },
      ]
    },
    {
      label: 'Orders & Customers',
      items: [
        { to: '/admin/orders', icon: <ShoppingBag size={18} />, label: 'Orders' },
        { to: '/admin/customers', icon: <Users size={18} />, label: 'Customers' },
      ]
    },
    {
      label: 'System',
      items: [
        { to: '/admin/settings', icon: <Settings size={18} />, label: 'Website Settings' },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0 md:w-16'} bg-navy-950 text-white flex flex-col transition-all duration-300 overflow-hidden shrink-0`}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-navy-800 h-16">
          <div className="w-8 h-8 bg-electric-600 rounded-lg flex items-center justify-center shrink-0">
            <Zap size={16} className="text-yellow-400" />
          </div>
          {sidebarOpen && (
            <div>
              <div className="font-display font-bold text-sm text-white leading-tight">TUYEL</div>
              <div className="text-xs text-electric-400 tracking-widest">ADMIN</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto admin-scroll py-3 px-2">
          {navGroups.map(group => (
            <div key={group.label} className="mb-4">
              {sidebarOpen && <div className="text-xs font-semibold text-navy-500 uppercase tracking-wider px-3 mb-1">{group.label}</div>}
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  title={!sidebarOpen ? item.label : undefined}
                  className={({ isActive }) =>
                    `admin-sidebar-link mb-0.5 ${isActive ? 'active' : ''} ${!sidebarOpen ? 'justify-center px-2' : ''}`
                  }
                >
                  {item.icon}
                  {sidebarOpen && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-3 border-t border-navy-800">
          {sidebarOpen && (
            <div className="flex items-center gap-2 px-3 py-2 mb-2">
              <div className="w-8 h-8 bg-electric-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-white truncate">{user?.name}</div>
                <div className="text-xs text-navy-400 capitalize">{user?.role}</div>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className={`admin-sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/20 ${!sidebarOpen ? 'justify-center px-2' : ''}`}>
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            {title && <h1 className="font-display font-bold text-navy-900 text-lg hidden sm:block">{title}</h1>}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" target="_blank" className="text-sm text-electric-600 hover:underline hidden sm:block">View Website ↗</Link>
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell size={18} className="text-gray-600" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
