const Conversation = require("../models/Conversation");

/** GET /api/chat/my  — customer fetches their own conversation */
const getMyConversation = async (req, res) => {
  try {
    let conv = await Conversation.findOne({ customer: req.user._id });
    if (!conv) {
      conv = await Conversation.create({
        customer: req.user._id,
        customerName: req.user.name,
        customerEmail: req.user.email,
        messages: [],
      });
    }
    conv.unreadByCustomer = 0;
    await conv.save();
    res.json({ success: true, conversation: conv });
  } catch (err) {
    console.error("getMyConversation:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/** POST /api/chat/my/message  — customer sends a message */
const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim())
      return res
        .status(400)
        .json({ success: false, message: "Text required." });

    let conv = await Conversation.findOne({ customer: req.user._id });
    if (!conv) {
      conv = await Conversation.create({
        customer: req.user._id,
        customerName: req.user.name,
        customerEmail: req.user.email,
        messages: [],
      });
    }

    if (conv.status === "resolved") {
      return res
        .status(400)
        .json({ success: false, message: "Conversation is resolved." });
    }

    const msg = {
      text: text.trim().slice(0, 2000),
      sender: req.user._id,
      senderName: req.user.name,
      isAdmin: false,
    };

    conv.messages.push(msg);
    conv.unreadByAdmin += 1;
    conv.lastMessage = msg.text;
    conv.lastMessageAt = new Date();
    conv.status = "open";
    await conv.save();

    const saved = conv.messages[conv.messages.length - 1];
    res.json({ success: true, message: saved });
  } catch (err) {
    console.error("sendMessage:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/** POST /api/chat/:id/reply  — admin sends a reply */
const sendReply = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim())
      return res
        .status(400)
        .json({ success: false, message: "Text required." });

    const conv = await Conversation.findById(req.params.id);
    if (!conv)
      return res.status(404).json({ success: false, message: "Not found." });

    const msg = {
      text: text.trim().slice(0, 2000),
      sender: req.user._id,
      senderName: req.user.name,
      isAdmin: true,
    };

    conv.messages.push(msg);
    conv.unreadByCustomer += 1;
    conv.lastMessage = msg.text;
    conv.lastMessageAt = new Date();
    await conv.save();

    const saved = conv.messages[conv.messages.length - 1];
    res.json({ success: true, message: saved });
  } catch (err) {
    console.error("sendReply:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/** GET /api/chat/all  — admin fetches all conversations */
const getAllConversations = async (req, res) => {
  try {
    const convs = await Conversation.find()
      .select(
        "customerName customerEmail status unreadByAdmin lastMessage lastMessageAt",
      )
      .sort({ lastMessageAt: -1 });
    res.json({ success: true, conversations: convs });
  } catch (err) {
    console.error("getAllConversations:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/** GET /api/chat/:id  — admin fetches one full conversation */
const getConversation = async (req, res) => {
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv)
      return res.status(404).json({ success: false, message: "Not found." });
    conv.unreadByAdmin = 0;
    await conv.save();
    res.json({ success: true, conversation: conv });
  } catch (err) {
    console.error("getConversation:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/** PATCH /api/chat/:id/resolve  — admin resolves a conversation */
const resolveConversation = async (req, res) => {
  try {
    const conv = await Conversation.findByIdAndUpdate(
      req.params.id,
      { status: "resolved" },
      { new: true },
    );
    if (!conv)
      return res.status(404).json({ success: false, message: "Not found." });
    res.json({ success: true, conversation: conv });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/** DELETE /api/chat/:id  — admin deletes a resolved conversation */
const deleteConversation = async (req, res) => {
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv)
      return res.status(404).json({ success: false, message: "Not found." });
    if (conv.status !== "resolved") {
      return res.status(400).json({
        success: false,
        message: "Only resolved conversations can be deleted.",
      });
    }
    await conv.deleteOne();
    res.json({ success: true, message: "Conversation deleted." });
  } catch (err) {
    console.error("deleteConversation:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
  getMyConversation,
  sendMessage,
  sendReply,
  getAllConversations,
  getConversation,
  resolveConversation,
  deleteConversation,
};
