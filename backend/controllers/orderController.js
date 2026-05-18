const { validationResult } = require('express-validator');
const Order   = require('../models/Order');
const Product = require('../models/Product');

/** Restore stock when an order is cancelled */
const restoreStock = async (items) => {
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }
};

/** POST /api/orders — Place a new order */
const createOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  const { items, shippingAddress } = req.body;
  try {
    if (req.user.isAdmin)
      return res.status(403).json({ success: false, message: 'Admins cannot place orders.' });

    if (!items || items.length === 0)
      return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });

    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product)
        return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
      if (product.stock < item.quantity)
        return res.status(400).json({ success: false, message: `Insufficient stock for "${product.name}". Available: ${product.stock}` });

      orderItems.push({ product: product._id, name: product.name, price: product.price, quantity: item.quantity, imageUrl: product.imageUrl });
      totalPrice += product.price * item.quantity;
      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      shippingAddress,
    });

    res.status(201).json({ success: true, message: 'Order placed successfully!', order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to place order.' });
  }
};

/** GET /api/orders/user — Get authenticated user's orders */
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name imageUrl')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
};

/** PATCH /api/orders/:id/cancel — Customer cancels their own pending order */
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order)
      return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.status !== 'pending')
      return res.status(400).json({ success: false, message: `Cannot cancel an order that is "${order.status}".` });

    order.status = 'cancelled';
    await order.save();
    await restoreStock(order.items);

    res.json({ success: true, message: 'Order cancelled successfully.', order });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel order.' });
  }
};

/** GET /api/orders/admin/all — Admin gets all orders */
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name imageUrl')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
};

/** PATCH /api/orders/admin/:id/status — Admin updates order status */
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(status))
    return res.status(400).json({ success: false, message: 'Invalid status value.' });

  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order)
      return res.status(404).json({ success: false, message: 'Order not found.' });

    const wasNotCancelled = order.status !== 'cancelled';
    const nowCancelled    = status === 'cancelled';

    // Restore stock only if transitioning TO cancelled from a non-cancelled state
    if (wasNotCancelled && nowCancelled) {
      await restoreStock(order.items);
    }

    order.status = status;
    await order.save();

    res.json({ success: true, message: `Order status updated to "${status}".`, order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order.' });
  }
};

module.exports = { createOrder, getUserOrders, cancelOrder, getAllOrders, updateOrderStatus };
