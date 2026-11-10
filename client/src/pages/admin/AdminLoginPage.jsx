import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, Lock, Mail, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLoginPage = () => {
  const [form, setForm] = useState({ email: 'admin@tuyel.com', password: 'Admin@123' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(form.email, form.password);
    if (result?.success === false) {
      setError(result.message || 'Login failed. Please verify credentials or database connection.');
    } else {
      navigate('/admin');
    }
    setLoading(false);
  };

  const fillCredentials = () => {
    setForm({ email: 'admin@tuyel.com', password: 'Admin@123' });
    setError('');
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4">
            <Zap size={32} className="text-yellow-400" />
          </div>
          <h1 className="font-display font-bold text-2xl text-white">TUYEL ELECTRICALS</h1>
          <p className="text-blue-200 text-sm mt-1">Admin Panel</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="font-display font-bold text-xl text-navy-900 mb-6 text-center">Sign In</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="admin@tuyel.com"
                  className="input-field pl-9"
                  autoComplete="email"
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Enter password"
                  className="input-field pl-9 pr-10"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? <><div className="spinner w-4 h-4" /> Signing in...</> : 'Sign In to Admin Panel'}
            </button>
          </form>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 flex items-center justify-between">
            <div>
              <span className="font-semibold">Demo Admin:</span> admin@tuyel.com / Admin@123
            </div>
            <button
              type="button"
              onClick={fillCredentials}
              className="text-electric-600 hover:text-electric-700 font-semibold underline ml-2"
            >
              Fill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
