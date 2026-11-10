const express = require('express');
const router = express.Router();
const { getStatistics, getRecentOrders, getRecentBookings, getSalesChart, getPopularProducts } = require('../controllers/dashboardController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

router.use(authenticate, requireAdmin);
router.get('/statistics', getStatistics);
router.get('/recent-orders', getRecentOrders);
router.get('/recent-bookings', getRecentBookings);
router.get('/sales', getSalesChart);
router.get('/popular-products', getPopularProducts);

module.exports = router;

