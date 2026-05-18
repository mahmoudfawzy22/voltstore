const Conversation = require('../models/Conversation');

/** GET /api/chat/my  — customer fetches their own conversation */
const getMyConversation = async (req, res) => {
  try {
    let conv = await Conversation.findOne({ customer: req.user._id });
    if (!conv) {
      // Auto-create on first visit
      conv = await Conversation.create({
        customer:      req.user._id,
        customerName:  req.user.name,
        customerEmail: req.user.email,
        messages:      [],
      });
    }
    // Mark customer's unread as 0
    conv.unreadByCustomer = 0;
    await conv.save();
    res.json({ success: true, conversation: conv });
  } catch (err) {
    console.error('getMyConversation:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/** GET /api/chat/all  — admin fetches all conversations */
const getAllConversations = async (req, res) => {
  try {
    const convs = await Conversation.find()
      .select('customerName customerEmail status unreadByAdmin lastMessage lastMessageAt')
      .sort({ lastMessageAt: -1 });
    res.json({ success: true, conversations: convs });
  } catch (err) {
    console.error('getAllConversations:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/** GET /api/chat/:id  — admin fetches one full conversation */
const getConversation = async (req, res) => {
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ success: false, message: 'Not found.' });
    // Mark admin unread as 0
    conv.unreadByAdmin = 0;
    await conv.save();
    res.json({ success: true, conversation: conv });
  } catch (err) {
    console.error('getConversation:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/** PATCH /api/chat/:id/resolve  — admin resolves a conversation */
const resolveConversation = async (req, res) => {
  try {
    const conv = await Conversation.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved' },
      { new: true }
    );
    if (!conv) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, conversation: conv });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/** DELETE /api/chat/:id  — admin deletes a resolved conversation */
const deleteConversation = async (req, res) => {
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ success: false, message: 'Not found.' });
    if (conv.status !== 'resolved') {
      return res.status(400).json({ success: false, message: 'Only resolved conversations can be deleted.' });
    }
    await conv.deleteOne();
    res.json({ success: true, message: 'Conversation deleted.' });
  } catch (err) {
    console.error('deleteConversation:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getMyConversation, getAllConversations, getConversation, resolveConversation, deleteConversation };
