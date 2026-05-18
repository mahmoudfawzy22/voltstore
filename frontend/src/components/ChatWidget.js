import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { connectSocket, getSocket } from '../services/socket';
import './ChatWidget.css';

const ChatWidget = () => {
  const { user } = useAuth();
  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [resolved, setResolved]   = useState(false);
  const [unread, setUnread]       = useState(0);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Connect socket and join chat when user logs in
  useEffect(() => {
    if (!user || user.isAdmin) return;

    const token  = localStorage.getItem('token');
    const socket = connectSocket(token);

    socket.emit('join_chat');

    socket.on('chat_ready', ({ messages: msgs }) => {
      setMessages(msgs);
      setConnected(true);
    });

    socket.on('new_message', ({ message }) => {
      setMessages((prev) => [...prev, message]);
      if (message.isAdmin && !open) {
        setUnread((u) => u + 1);
      }
    });

    socket.on('conversation_resolved', () => setResolved(true));
    socket.on('connect',    () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.off('chat_ready');
      socket.off('new_message');
      socket.off('conversation_resolved');
    };
  }, [user]);

  // Scroll on new messages
  useEffect(() => { scrollToBottom(); }, [messages, open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || resolved) return;
    const socket = getSocket();
    if (!socket) return;
    socket.emit('send_message', { text });
    setInput('');
  }, [input, resolved]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Don't render for admins or guests
  if (!user || user.isAdmin) return null;

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="chat-widget">
      {/* Chat window */}
      {open && (
        <div className="chat-window card fade-in">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar-wrap">
                <img src="/logo.svg" alt="Support" className="chat-logo" />
                <span className={`chat-status-dot ${connected ? 'online' : 'offline'}`} />
              </div>
              <div>
                <div className="chat-header-title">VoltStore Support</div>
                <div className="chat-header-sub">
                  {resolved ? '✅ Resolved' : connected ? 'Online' : 'Connecting…'}
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
              disabled={resolved}
              rows={1}
            />
            <button
              className="chat-send"
              onClick={sendMessage}
              disabled={!input.trim() || resolved}
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
