const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Conversation = require('./models/Conversation');

/**
 * Attach Socket.io to the HTTP server.
 * Events:
 *   customer  → join_chat, send_message
 *   admin     → join_admin, join_conversation, send_reply, resolve_conversation
 *   server    → new_message, conversation_updated, error
 */
const initSocket = (io) => {
  // ── Auth middleware for sockets ──────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user    = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Auth failed'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`🔌 Socket connected: ${user.name} (${user.isAdmin ? 'admin' : 'customer'})`);

    // ── CUSTOMER joins their own chat room ────────────────────
    socket.on('join_chat', async () => {
      try {
        let conv = await Conversation.findOne({ customer: user._id });
        if (!conv) {
          conv = await Conversation.create({
            customer:      user._id,
            customerName:  user.name,
            customerEmail: user.email,
            messages:      [],
          });
        }
        socket.join(`conv_${conv._id}`);
        socket.convId = conv._id.toString();
        socket.emit('chat_ready', { conversationId: conv._id, messages: conv.messages });
      } catch (err) {
        socket.emit('error', { message: 'Could not load chat.' });
      }
    });

    // ── CUSTOMER sends a message ──────────────────────────────
    socket.on('send_message', async ({ text }) => {
      if (!text?.trim()) return;
      try {
        const conv = await Conversation.findOne({ customer: user._id });
        if (!conv) return;

        const msg = {
          text:       text.trim().slice(0, 2000),
          sender:     user._id,
          senderName: user.name,
          isAdmin:    false,
        };

        conv.messages.push(msg);
        conv.unreadByAdmin   += 1;
        conv.lastMessage      = msg.text;
        conv.lastMessageAt    = new Date();
        conv.status           = 'open';
        await conv.save();

        const saved = conv.messages[conv.messages.length - 1];

        // Broadcast to the room (customer + any admin watching)
        io.to(`conv_${conv._id}`).emit('new_message', { conversationId: conv._id, message: saved });

        // Notify all admins in the admin dashboard room
        io.to('admin_room').emit('conversation_updated', {
          conversationId: conv._id,
          customerName:   conv.customerName,
          lastMessage:    conv.lastMessage,
          lastMessageAt:  conv.lastMessageAt,
          unreadByAdmin:  conv.unreadByAdmin,
          status:         conv.status,
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message.' });
      }
    });

    // ── ADMIN joins dashboard room (sees all conversations) ───
    socket.on('join_admin', () => {
      if (!user.isAdmin) return;
      socket.join('admin_room');
    });

    // ── ADMIN opens a specific conversation ───────────────────
    socket.on('join_conversation', async ({ conversationId }) => {
      if (!user.isAdmin) return;
      socket.join(`conv_${conversationId}`);
      // Mark admin unread = 0
      await Conversation.findByIdAndUpdate(conversationId, { unreadByAdmin: 0 });
    });

    // ── ADMIN leaves a conversation room ─────────────────────
    socket.on('leave_conversation', ({ conversationId }) => {
      socket.leave(`conv_${conversationId}`);
    });

    // ── ADMIN sends a reply ───────────────────────────────────
    socket.on('send_reply', async ({ conversationId, text }) => {
      if (!user.isAdmin || !text?.trim()) return;
      try {
        const conv = await Conversation.findById(conversationId);
        if (!conv) return;

        const msg = {
          text:       text.trim().slice(0, 2000),
          sender:     user._id,
          senderName: user.name,
          isAdmin:    true,
        };

        conv.messages.push(msg);
        conv.unreadByCustomer += 1;
        conv.lastMessage       = msg.text;
        conv.lastMessageAt     = new Date();
        await conv.save();

        const saved = conv.messages[conv.messages.length - 1];

        io.to(`conv_${conv._id}`).emit('new_message', { conversationId: conv._id, message: saved });
        io.to('admin_room').emit('conversation_updated', {
          conversationId: conv._id,
          customerName:   conv.customerName,
          lastMessage:    conv.lastMessage,
          lastMessageAt:  conv.lastMessageAt,
          unreadByAdmin:  0,
          status:         conv.status,
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to send reply.' });
      }
    });

    // ── ADMIN resolves a conversation ─────────────────────────
    socket.on('resolve_conversation', async ({ conversationId }) => {
      if (!user.isAdmin) return;
      try {
        const conv = await Conversation.findByIdAndUpdate(
          conversationId,
          { status: 'resolved' },
          { new: true }
        );
        io.to(`conv_${conv._id}`).emit('conversation_resolved', { conversationId });
        io.to('admin_room').emit('conversation_updated', {
          conversationId: conv._id,
          customerName:   conv.customerName,
          lastMessage:    conv.lastMessage,
          lastMessageAt:  conv.lastMessageAt,
          unreadByAdmin:  0,
          status:         'resolved',
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to resolve.' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${user.name}`);
    });
  });
};

module.exports = initSocket;
