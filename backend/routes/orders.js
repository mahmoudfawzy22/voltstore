const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { admin }   = require('../middleware/admin');
const {
  createOrder,
  getUserOrders,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

const router = express.Router();
router.use(protect);

const orderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
  body('shippingAddress.address').trim().notEmpty().withMessage('Address is required'),
  body('shippingAddress.phone')
    .trim().notEmpty().withMessage('Phone number is required')
    .matches(/^[0-9+\-\s()]{7,20}$/).withMessage('Invalid phone number'),
];

// Customer routes
router.post('/',             orderValidation, createOrder);
router.get('/user',          getUserOrders);
router.patch('/:id/cancel',  cancelOrder);

// Admin routes
router.get('/admin/all',            admin, getAllOrders);
router.patch('/admin/:id/status',   admin, updateOrderStatus);

module.exports = router;
