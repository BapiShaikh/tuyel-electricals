const { pool } = require('../config/database');

// GET /api/v1/dashboard/statistics
const getStatistics = async (req, res, next) => {
  try {
    const [[products]] = await pool.query('SELECT COUNT(*) as total FROM products WHERE is_active = 1');
    const [[services]] = await pool.query('SELECT COUNT(*) as total FROM services WHERE is_active = 1');
    const [[orders]] = await pool.query('SELECT COUNT(*) as total FROM orders');
    const [[bookings]] = await pool.query('SELECT COUNT(*) as total FROM service_bookings');
    const [[pendingOrders]] = await pool.query("SELECT COUNT(*) as total FROM orders WHERE status = 'pending'");
    const [[pendingBookings]] = await pool.query("SELECT COUNT(*) as total FROM service_bookings WHERE status = 'pending'");
    const [[customers]] = await pool.query('SELECT COUNT(*) as total FROM customers');
    const [[lowStock]] = await pool.query('SELECT COUNT(*) as total FROM products WHERE stock_quantity <= low_stock_threshold AND is_active = 1');
    const [[monthSales]] = await pool.query(
      "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW()) AND status != 'cancelled'"
    );
    const [[monthBookings]] = await pool.query(
      "SELECT COUNT(*) as total FROM service_bookings WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())"
    );
    res.json({
      success: true,
      data: {
        total_products: products.total,
        total_services: services.total,
        total_orders: orders.total,
        total_bookings: bookings.total,
        pending_orders: pendingOrders.total,
        pending_bookings: pendingBookings.total,
        total_customers: customers.total,
        low_stock_products: lowStock.total,
        monthly_sales: parseFloat(monthSales.total),
        monthly_bookings: monthBookings.total
      }
    });
  } catch (error) { next(error); }
};

// GET /api/v1/dashboard/recent-orders
const getRecentOrders = async (req, res, next) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 10');
    res.json({ success: true, data: orders });
  } catch (error) { next(error); }
};

// GET /api/v1/dashboard/recent-bookings
const getRecentBookings = async (req, res, next) => {
  try {
    const [bookings] = await pool.query(
      `SELECT sb.*, s.name as service_name, sc.name as category_name FROM service_bookings sb
       JOIN services s ON sb.service_id = s.id JOIN service_categories sc ON sb.service_category_id = sc.id
       ORDER BY sb.created_at DESC LIMIT 10`
    );
    res.json({ success: true, data: bookings });
  } catch (error) { next(error); }
};

// GET /api/v1/dashboard/sales
const getSalesChart = async (req, res, next) => {
  try {
    const [monthly] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as orders, SUM(total_amount) as revenue
       FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH) AND status != 'cancelled'
       GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY month`
    );
    const [bookingChart] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as bookings
       FROM service_bookings WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY month`
    );
    res.json({ success: true, data: { sales: monthly, bookings: bookingChart } });
  } catch (error) { next(error); }
};

// GET /api/v1/dashboard/popular-products
const getPopularProducts = async (req, res, next) => {
  try {
    const [products] = await pool.query(
      `SELECT p.id, p.name, p.selling_price, p.stock_quantity, p.views,
              (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image,
              COUNT(oi.id) as order_count
       FROM products p LEFT JOIN order_items oi ON p.id = oi.product_id
       WHERE p.is_active = 1 GROUP BY p.id ORDER BY order_count DESC, p.views DESC LIMIT 8`
    );
    res.json({ success: true, data: products });
  } catch (error) { next(error); }
};

module.exports = { getStatistics, getRecentOrders, getRecentBookings, getSalesChart, getPopularProducts };

