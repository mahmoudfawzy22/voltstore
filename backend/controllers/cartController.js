const Product = require('../models/Product');

// Simple in-memory cart store keyed by userId.
// In production, replace with a Cart mongoose model for full persistence.
const carts = {};

const getCart = (userId) => carts[userId] || [];
const setCart = (userId, cart) => { carts[userId] = cart; };

/**
 * GET /api/cart
 * Return the current user's cart with enriched product data
 */
const getCartItems = async (req, res) => {
  try {
    const cart = getCart(req.user._id.toString());
    // Re-fetch prices from DB to prevent price tampering
    const enriched = await Promise.all(
      cart.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) return null;
        return {
          productId: product._id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          stock: product.stock,
          quantity: item.quantity,
        };
      })
    );
    res.json({ success: true, cart: enriched.filter(Boolean) });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cart.' });
  }
};

/**
 * POST /api/cart
 * Add or update a cart item
 */
const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, message: 'productId is required.' });
  }
  if (req.user.isAdmin) {
    return res.status(403).json({ success: false, message: 'Admins cannot add items to cart.' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const userId = req.user._id.toString();
    const cart = getCart(userId);
    const existingIndex = cart.findIndex((i) => i.productId === productId);

    if (existingIndex >= 0) {
      const newQty = cart[existingIndex].quantity + quantity;
      if (newQty > product.stock) {
        return res.status(400).json({ success: false, message: `Only ${product.stock} in stock.` });
      }
      cart[existingIndex].quantity = newQty;
    } else {
      if (quantity > product.stock) {
        return res.status(400).json({ success: false, message: `Only ${product.stock} in stock.` });
      }
      cart.push({ productId, quantity });
    }

    setCart(userId, cart);
    res.json({ success: true, message: 'Cart updated.', cart });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to update cart.' });
  }
};

/**
 * PUT /api/cart/:productId
 * Update quantity of a cart item (set to 0 to remove)
 */
const updateCartItem = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined || quantity < 0) {
    return res.status(400).json({ success: false, message: 'Valid quantity required.' });
  }

  try {
    const userId = req.user._id.toString();
    let cart = getCart(userId);

    if (quantity === 0) {
      cart = cart.filter((i) => i.productId !== productId);
    } else {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }
      if (quantity > product.stock) {
        return res.status(400).json({ success: false, message: `Only ${product.stock} in stock.` });
      }
      const idx = cart.findIndex((i) => i.productId === productId);
      if (idx >= 0) cart[idx].quantity = quantity;
    }

    setCart(userId, cart);
    res.json({ success: true, message: 'Cart updated.', cart });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to update cart.' });
  }
};

/**
 * DELETE /api/cart/:productId
 * Remove item from cart
 */
const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id.toString();
  const cart = getCart(userId).filter((i) => i.productId !== productId);
  setCart(userId, cart);
  res.json({ success: true, message: 'Item removed.', cart });
};

/**
 * DELETE /api/cart
 * Clear entire cart
 */
const clearCart = async (req, res) => {
  setCart(req.user._id.toString(), []);
  res.json({ success: true, message: 'Cart cleared.' });
};

module.exports = { getCartItems, addToCart, updateCartItem, removeFromCart, clearCart };
