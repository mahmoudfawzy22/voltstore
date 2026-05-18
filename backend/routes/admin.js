const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { admin }   = require('../middleware/admin');
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProductsAdmin,
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes: must be logged in AND isAdmin
router.use(protect, admin);

const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('imageUrl').trim().notEmpty().withMessage('Image URL is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

router.get('/products', getAllProductsAdmin);
router.post('/products', productValidation, createProduct);
router.put('/products/:id', productValidation, updateProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;
