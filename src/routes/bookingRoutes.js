const express = require('express');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.post('/', bookingController.createBooking);
router.get('/', bookingController.getAllBookings);
router.get('/:id/open-track.gif', bookingController.trackOpen);
router.get('/:id', bookingController.getBookingById);
router.put('/:id', bookingController.updateBookingById);
router.patch('/:id/status', bookingController.updateBookingStatus);
router.delete('/:id', bookingController.deleteBookingById);

module.exports = router;
