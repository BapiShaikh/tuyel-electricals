const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrder, updateOrderStatus } = require('../controllers/orderController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

router.post('/', createOrder);
router.get('/', authenticate, requireAdmin, getOrders);
router.get('/:id', authenticate, requireAdmin, getOrder);
router.put('/:id/status', authenticate, requireAdmin, updateOrderStatus);

module.exports = router;

