const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const productRoutes = require('./products');
const categoryRoutes = require('./categories');
const brandRoutes = require('./brands');
const serviceRoutes = require('./services');
const bookingRoutes = require('./bookings');
const orderRoutes = require('./orders');
const dashboardRoutes = require('./dashboard');
const settingsRoutes = require('./settings');

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/services', serviceRoutes);
router.use('/bookings', bookingRoutes);
router.use('/orders', orderRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/', settingsRoutes);

module.exports = router;

