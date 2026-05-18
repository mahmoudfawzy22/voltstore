const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderName: { type: String, required: true },
    isAdmin:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

const conversationSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one conversation per customer
    },
    customerName:  { type: String, required: true },
    customerEmail: { type: String, required: true },
    messages:      [messageSchema],
    status: {
      type: String,
      enum: ['open', 'resolved'],
      default: 'open',
    },
    unreadByAdmin:    { type: Number, default: 0 },
    unreadByCustomer: { type: Number, default: 0 },
    lastMessage:      { type: String, default: '' },
    lastMessageAt:    { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conversation', conversationSchema);
