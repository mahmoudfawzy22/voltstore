const express = require("express");
const { protect } = require("../middleware/auth");
const { admin } = require("../middleware/admin");
const {
  getMyConversation,
  sendMessage,
  sendReply,
  getAllConversations,
  getConversation,
  resolveConversation,
  deleteConversation,
} = require("../controllers/chatController");

const router = express.Router();

// Customer routes
router.get("/my", protect, getMyConversation);
router.post("/my/message", protect, sendMessage);

// Admin routes
router.get("/all", protect, admin, getAllConversations);
router.get("/:id", protect, admin, getConversation);
router.post("/:id/reply", protect, admin, sendReply);
router.patch("/:id/resolve", protect, admin, resolveConversation);
router.delete("/:id", protect, admin, deleteConversation);

module.exports = router;
