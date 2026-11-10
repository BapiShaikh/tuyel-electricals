import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';

// Public Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ServicesPage from './pages/ServicesPage';
import BookServicePage from './pages/BookServicePage';
import CartPage from './pages/CartPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import TrackBookingPage from './pages/TrackBookingPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminBookingListPage, { AdminBookingDetailPage } from './pages/admin/AdminBookingsPage';
import AdminOrderListPage, { AdminOrderDetailPage } from './pages/admin/AdminOrdersPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminBrandsPage from './pages/admin/AdminBrandsPage';
import AdminServiceCategoriesPage from './pages/admin/AdminServiceCategoriesPage';

// Protected Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated || !isAdmin) return <Navigate to="/admin/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <CartProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/shop/product/:slug" element={<ProductDetailPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/book-service" element={<BookServicePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/track-booking" element={<TrackBookingPage />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
              <Route path="/admin/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
              <Route path="/admin/categories" element={<AdminRoute><AdminCategoriesPage /></AdminRoute>} />
              <Route path="/admin/brands" element={<AdminRoute><AdminBrandsPage /></AdminRoute>} />
              <Route path="/admin/services" element={<AdminRoute><AdminServicesPage /></AdminRoute>} />
              <Route path="/admin/service-categories" element={<AdminRoute><AdminServiceCategoriesPage /></AdminRoute>} />
              <Route path="/admin/bookings" element={<AdminRoute><AdminBookingListPage /></AdminRoute>} />
              <Route path="/admin/bookings/:id" element={<AdminRoute><AdminBookingDetailPage /></AdminRoute>} />
              <Route path="/admin/orders" element={<AdminRoute><AdminOrderListPage /></AdminRoute>} />
              <Route path="/admin/orders/:id" element={<AdminRoute><AdminOrderDetailPage /></AdminRoute>} />
              <Route path="/admin/customers" element={<AdminRoute><AdminCustomersPage /></AdminRoute>} />
              <Route path="/admin/inventory" element={<AdminRoute><AdminInventoryPage /></AdminRoute>} />
              <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />

              {/* 404 Route */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="text-8xl mb-4">⚡</div>
                    <h1 className="text-4xl font-bold text-navy-900 mb-2">404</h1>
                    <p className="text-gray-500 mb-6">Page not found</p>
                    <a href="/" className="btn-primary">Go Home</a>
                  </div>
                </div>
              } />
            </Routes>
          </CartProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
