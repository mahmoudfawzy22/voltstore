const express = require('express');
const { protect } = require('../middleware/auth');
const { admin }   = require('../middleware/admin');
const {
  getMyConversation,
  getAllConversations,
  getConversation,
  resolveConversation,
  deleteConversation,
} = require('../controllers/chatController');

const router = express.Router();

router.get('/my',            protect, getMyConversation);
router.get('/all',           protect, admin, getAllConversations);
router.get('/:id',           protect, admin, getConversation);
router.patch('/:id/resolve', protect, admin, resolveConversation);
router.delete('/:id',        protect, admin, deleteConversation);

module.exports = router;
