import React, { useState, useEffect, useRef, useCallback } from 'react';
import { connectSocket, getSocket } from '../services/socket';
import { chatService } from '../services/api';
import './SupportPage.css';

const SupportPage = () => {
  const [conversations, setConversations] = useState([]);
  const [active, setActive]               = useState(null); // full conversation object
  const [loading, setLoading]             = useState(true);
  const [loadingChat, setLoadingChat]     = useState(false);
  const [reply, setReply]                 = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]           = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  // Load conversation list + connect socket
  useEffect(() => {
    const token  = localStorage.getItem('token');
    const socket = connectSocket(token);

    socket.emit('join_admin');

    // Update sidebar when any conversation gets a new message
    socket.on('conversation_updated', ({ conversationId, ...update }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId ? { ...c, ...update } : c
        ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      );
    });

    // Live message in currently open conversation
    socket.on('new_message', ({ conversationId, message }) => {
      setActive((prev) => {
        if (!prev || prev._id !== conversationId) return prev;
        return { ...prev, messages: [...prev.messages, message] };
      });
    });

    socket.on('conversation_resolved', ({ conversationId }) => {
      setConversations((prev) =>
        prev.map((c) => c._id === conversationId ? { ...c, status: 'resolved' } : c)
      );
      setActive((prev) =>
        prev?._id === conversationId ? { ...prev, status: 'resolved' } : prev
      );
    });

    // Fetch all conversations via REST
    chatService.getAll()
      .then(({ data }) => setConversations(data.conversations))
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => {
      socket.off('conversation_updated');
      socket.off('new_message');
      socket.off('conversation_resolved');
    };
  }, []);

  useEffect(() => { scrollToBottom(); }, [active?.messages]);

  // Open a conversation
  const openConversation = useCallback(async (conv) => {
    setLoadingChat(true);
    const socket = getSocket();

    if (active) socket.emit('leave_conversation', { conversationId: active._id });

    try {
      const { data } = await chatService.getOne(conv._id);
      setActive(data.conversation);
      socket.emit('join_conversation', { conversationId: conv._id });
      // Clear unread in sidebar
      setConversations((prev) =>
        prev.map((c) => c._id === conv._id ? { ...c, unreadByAdmin: 0 } : c)
      );
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch {
      // ignore
    } finally {
      setLoadingChat(false);
    }
  }, [active]);

  // Send reply
  const sendReply = useCallback(() => {
    const text = reply.trim();
    if (!text || !active) return;
    const socket = getSocket();
    socket.emit('send_reply', { conversationId: active._id, text });
    setReply('');
  }, [reply, active]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); }
  };

  // Resolve conversation
  const resolveConversation = () => {
    if (!active) return;
    const socket = getSocket();
    socket.emit('resolve_conversation', { conversationId: active._id });
  };

  // Delete conversation (only allowed when resolved)
  const handleDelete = useCallback(async () => {
    if (!active) return;
    setDeleting(true);
    try {
      await chatService.delete(active._id);
      setConversations((prev) => prev.filter((c) => c._id !== active._id));
      setActive(null);
      setConfirmDelete(false);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  }, [active]);

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDate = (iso) => {
    const d = new Date(iso);
    const today = new Date();
    return d.toDateString() === today.toDateString()
      ? formatTime(iso)
      : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="support-page">
      {/* ── Sidebar: conversation list ─────────────────────────── */}
      <aside className="support-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Support Inbox</h2>
          <span className="sidebar-count">{conversations.length}</span>
        </div>

        {loading && <div className="spinner" style={{ margin: '40px auto' }} />}

        {!loading && conversations.length === 0 && (
          <div className="sidebar-empty">No conversations yet.</div>
        )}

        <div className="conv-list">
          {conversations.map((conv) => (
            <button
              key={conv._id}
              className={`conv-item ${active?._id === conv._id ? 'active' : ''} ${conv.status === 'resolved' ? 'resolved' : ''}`}
              onClick={() => openConversation(conv)}
            >
              <div className="conv-avatar">
                {conv.customerName.charAt(0).toUpperCase()}
              </div>
              <div className="conv-meta">
                <div className="conv-name-row">
                  <span className="conv-name">{conv.customerName}</span>
                  <span className="conv-time">{formatDate(conv.lastMessageAt)}</span>
                </div>
                <div className="conv-preview">{conv.lastMessage || 'No messages yet'}</div>
              </div>
              {conv.unreadByAdmin > 0 && (
                <span className="conv-unread">{conv.unreadByAdmin}</span>
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* ── Main chat panel ───────────────────────────────────── */}
      <main className="support-main">
        {!active ? (
          <div className="support-placeholder">
            <div className="placeholder-icon">💬</div>
            <h3>Select a conversation</h3>
            <p>Choose a customer from the left to start replying</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="support-chat-header">
              <div className="support-chat-info">
                <div className="support-avatar">
                  {active.customerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="support-chat-name">{active.customerName}</div>
                  <div className="support-chat-email">{active.customerEmail}</div>
                </div>
              </div>
              <div className="support-actions">
                <span className={`status-pill ${active.status}`}>
                  {active.status === 'resolved' ? '✅ Resolved' : '🔵 Open'}
                </span>
                {active.status !== 'resolved' && (
                  <button className="btn btn-secondary btn-sm" onClick={resolveConversation}>
                    Mark Resolved
                  </button>
                )}
                {active.status === 'resolved' && (
                  <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>
                    🗑 Delete Chat
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="support-messages">
              {loadingChat && <div className="spinner" />}
              {!loadingChat && active.messages.length === 0 && (
                <div className="support-no-msgs">No messages yet. Wait for the customer to write.</div>
              )}
              {!loadingChat && active.messages.map((msg, i) => (
                <div key={msg._id || i} className={`support-msg ${msg.isAdmin ? 'admin' : 'customer'}`}>
                  <div className="support-msg-label">
                    {msg.isAdmin ? 'You (Admin)' : msg.senderName}
                  </div>
                  <div className="support-bubble">
                    <p>{msg.text}</p>
                    <span className="support-time">{formatTime(msg.createdAt)}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply box */}
            <div className="support-reply-wrap">
              {active.status === 'resolved' ? (
                <div className="support-resolved-bar">
                  ✅ This conversation is resolved. No further replies needed.
                </div>
              ) : (
                <>
                  <textarea
                    ref={inputRef}
                    className="support-reply-input"
                    placeholder={`Reply to ${active.customerName}…`}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={handleKey}
                    rows={3}
                  />
                  <div className="support-reply-footer">
                    <span className="support-hint">Enter to send · Shift+Enter for new line</span>
                    <button
                      className="btn btn-primary"
                      onClick={sendReply}
                      disabled={!reply.trim()}
                    >
                      Send Reply
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </main>

      {/* ── Delete Confirmation Modal ──────────────────────────── */}
      {confirmDelete && (
        <div className="delete-modal-overlay" onClick={() => setConfirmDelete(false)}>
          <div className="delete-modal card fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon">🗑️</div>
            <h3 className="delete-modal-title">Delete Conversation?</h3>
            <p className="delete-modal-body">
              This will permanently delete the chat with <strong>{active?.customerName}</strong>.
              This action cannot be undone.
            </p>
            <div className="delete-modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPage;
