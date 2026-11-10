const express = require('express');
const router = express.Router();
const { createBooking, getBookings, getBooking, updateBookingStatus, trackBooking } = require('../controllers/bookingController');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const { bookingUpload } = require('../middlewares/upload');

router.post('/', bookingUpload.single('problem_image'), createBooking);
router.get('/track/:bookingId', trackBooking);
router.get('/', authenticate, requireAdmin, getBookings);
router.get('/:id', authenticate, requireAdmin, getBooking);
router.put('/:id/status', authenticate, requireAdmin, updateBookingStatus);

module.exports = router;

