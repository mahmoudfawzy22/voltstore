import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './ChatWidget.css';

const ChatWidget = () => {
  const { user } = useAuth();
  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [resolved, setResolved]   = useState(false);
  const [unread, setUnread]       = useState(0);
  const [convId, setConvId]       = useState(null);
  const [sending, setSending]     = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const pollRef        = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversation on mount
  useEffect(() => {
    if (!user || user.isAdmin) return;

    const loadConversation = async () => {
      try {
        const res = await api.get('/chat/my');
        const conv = res.data.conversation;
        setConvId(conv._id);
        setMessages(conv.messages);
        setResolved(conv.status === 'resolved');
      } catch (err) {
        console.error('Failed to load conversation:', err);
      }
    };

    loadConversation();
  }, [user]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!user || user.isAdmin || !convId) return;

    const poll = async () => {
      try {
        const res = await api.get('/chat/my');
        const conv = res.data.conversation;
        setMessages((prev) => {
          if (conv.messages.length !== prev.length) {
            // Count new admin messages
            const newAdminMsgs = conv.messages
              .slice(prev.length)
              .filter((m) => m.isAdmin).length;
            if (newAdminMsgs > 0 && !open) {
              setUnread((u) => u + newAdminMsgs);
            }
          }
          return conv.messages;
        });
        setResolved(conv.status === 'resolved');
      } catch (err) {
        console.error('Poll error:', err);
      }
    };

    pollRef.current = setInterval(poll, 3000);
    return () => clearInterval(pollRef.current);
  }, [convId, user, open]);

  // Scroll on new messages
  useEffect(() => { scrollToBottom(); }, [messages, open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || resolved || sending) return;

    setSending(true);
    try {
      const res = await api.post('/chat/my/message', { text });
      setMessages((prev) => [...prev, res.data.message]);
      setInput('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  }, [input, resolved, sending]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user || user.isAdmin) return null;

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-window card fade-in">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar-wrap">
                <img src="/logo.svg" alt="Support" className="chat-logo" />
                <span className="chat-status-dot online" />
              </div>
              <div>
                <div className="chat-header-title">VoltStore Support</div>
                <div className="chat-header-sub">
                  {resolved ? '✅ Resolved' : 'Online'}
                </div>
              </div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-empty">
                <span>👋</span>
                <p>Hi {user.name.split(' ')[0]}! How can we help you today?</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={msg._id || i} className={`chat-msg ${msg.isAdmin ? 'admin' : 'customer'}`}>
                <div className="chat-bubble">
                  <p>{msg.text}</p>
                  <span className="chat-time">{formatTime(msg.createdAt)}</span>
                </div>
              </div>
            ))}
            {resolved && (
              <div className="chat-resolved-notice">
                This conversation has been marked as resolved.
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-wrap">
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder={resolved ? 'Conversation resolved' : 'Type your message…'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={resolved || sending}
              rows={1}
            />
            <button
              className="chat-send"
              onClick={sendMessage}
              disabled={!input.trim() || resolved || sending}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating bubble */}
      <button className="chat-bubble-btn" onClick={() => setOpen((o) => !o)}>
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
        {!open && unread > 0 && <span className="chat-unread-badge">{unread}</span>}
      </button>
    </div>
  );
};

export default ChatWidget;