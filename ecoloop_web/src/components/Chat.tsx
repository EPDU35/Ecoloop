import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useConversations, useConversation } from '../services/notificationService';
import './Chat.css';

interface ChatProps {
  conversationId?: string;
  onClose?: () => void;
  className?: string;
}

export default function Chat({ conversationId, onClose, className = '' }: ChatProps) {
  const { conversations, loading: conversationsLoading } = useConversations();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(conversationId || null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newConversation, setNewConversation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const conversation = useConversation(activeConversationId || '');
  const { messages, loading, sendMessage, typing, loadMore } = conversation;

  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showAttachments, setShowAttachments] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    if (!messageInput.trim() && attachments.length === 0) return;
    setSending(true);
    try {
      await sendMessage(messageInput, attachments.length > 0 ? attachments : undefined);
      setMessageInput('');
      setAttachments([]);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const validFiles = files.filter(f => f.size <= 10 * 1024 * 1024);
      if (validFiles.length !== files.length) {
        alert('Certains fichiers depassent 10 Mo et ont ete ignores');
      }
      setAttachments(prev => [...prev, ...validFiles].slice(0, 5));
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
    if (date.toDateString() === yesterday.toDateString()) return "Hier";
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const filteredConversations = conversations.filter(c =>
    c.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const renderMessages = () => {
    if (!conversation?.messages.length) {
      return (
        <div className="el-chat-empty">
          <p>Aucun message pour l'instant</p>
          <p className="el-chat-empty-hint">Soyez le premier à envoyer un message !</p>
        </div>
      );
    }

    return (
      <>
        {messages.map((msg, index) => {
          const showDate = index === 0 ||
            formatDate(new Date(messages[index - 1].timestamp)) !== formatDate(new Date(msg.timestamp));
          const isOwn = msg.senderId === 'current_user_id';

          return (
            <React.Fragment key={msg.id}>
              {showDate && (
                <div className="el-chat-date-separator" key={'date-' + msg.timestamp}>
                  <span>{formatDate(new Date(msg.timestamp))}</span>
                </div>
              )}
              <div className={'el-message ' + (isOwn ? 'own' : '')}>
                {!isOwn && (
                  <div className="el-message-avatar">
                    <div className="el-avatar-placeholder">
                      {msg.senderName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
                <div className="el-message-content">
                  <div className="el-message-header">
                    <span className="el-message-sender">{msg.senderName}</span>
                    <span className="el-message-time">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div className={'el-message-bubble ' + msg.senderRole}>
                    <p>{msg.content}</p>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="el-message-attachments">
                        {msg.attachments.map((att, i) => (
                          <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="el-attachment">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <line x1="10" y1="9" x2="8" y2="9" />
                            </svg>
                            <span>{att.url.split('/').pop()}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="el-message-time">{formatTime(msg.timestamp)}</span>
                  {isOwn && msg.read && (
                    <span className="el-message-read">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 13l-5 5-4-4" />
                      </svg>
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </React.Fragment>
      );
    };

    return (
      <div className={'el-chat ' + className}>
        <aside className={'el-chat-sidebar ' + (sidebarOpen ? 'open' : '') + (!conversationId ? ' always-open' : '')}>
          <header className="el-chat-sidebar-header">
            <h2>Messages</h2>
            <div className="el-chat-sidebar-actions">
              <button className="el-icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label={sidebarOpen ? 'Fermer' : 'Ouvrir'}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {sidebarOpen ? (
                    <path d="M18 6L6 18M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              <button className="el-icon-btn" onClick={() => setNewConversation(true)} aria-label="Nouvelle conversation">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </svg>
            </button>
          </div>
        </header>

        <div className="el-chat-search">
          <input
            type="text"
            placeholder="Rechercher une conversation..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="el-chat-search-input"
          />
        </div>

        <div className="el-conversations-list">
          {conversationsLoading ? (
            <div className="el-loading">Chargement...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="el-empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p>{searchQuery ? 'Aucun resultat' : 'Aucune conversation'}</p>
            </div>
          ) : (
            <ul className="el-conversation-list">
              {filteredConversations.map(conv => (
                <li
                  key={conv.id}
                  className={'el-conversation-item ' + (activeConversationId === conv.id ? 'active' : '') + (conv.unreadCount > 0 ? ' unread' : '')}
                  onClick={() => {
                    setActiveConversationId(conv.id);
                    setSidebarOpen(true);
                  }}
                >
                  <div className={'el-conversation-avatar ' + (conv.isOnline ? 'online' : '')}>
                    {conv.participantAvatar ? (
                      <img src={conv.participantAvatar} alt="" />
                    ) : (
                      <div className="el-avatar-placeholder">
                        {conv.participantName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {conv.isOnline && <span className="el-online-indicator" />}
                  </div>
                  <div className="el-conversation-info">
                    <div className="el-conversation-header">
                      <span className="el-conversation-name">{conv.participantName}</span>
                      <span className="el-conversation-time">{conv.lastMessageTime}</span>
                    </div>
                    <div className="el-conversation-preview">
                      <span className="el-conv-role">{conv.participantRole}</span>
                      <span className="el-conv-message">{conv.lastMessage}</span>
                    </div>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="el-unread-badge">{conv.unreadCount > 9 ? '9+' : conv.unreadCount}</span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {newConversation && (
            <div className="el-new-conversation">
              <h4>Nouvelle conversation</h4>
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                className="el-input"
              />
              <div className="el-new-conv-users">
              </div>
              <button className="el-btn el-btn-secondary" onClick={() => setNewConversation(false)}>
                Annuler
              </button>
            </div>
          )}
        </div>
      </aside>

      {sidebarOpen && (
        <div className="el-chat-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <main className={'el-chat-main ' + (activeConversationId ? 'has-conversation' : '')}>
        {!activeConversationId ? (
          <div className="el-chat-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <h2>Bienvenue sur EcoLoop Chat</h2>
            <p>Selectionnez une conversation ou creez-en une nouvelle pour commencer a discuter.
            <button className="el-btn el-btn-primary" onClick={() => setNewConversation(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Nouvelle conversation
            </button>
          </div>
        ) : (
          <>
            <header className="el-chat-header">
              <div className="el-chat-header-info">
                <button className="el-chat-back-btn" onClick={() => setSidebarOpen(true)} aria-label="Ouvrir le menu">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
                <div className="el-chat-header-avatar">
                  {activeConversation?.participantAvatar ? (
                    <img src={activeConversation.participantAvatar} alt="" />
                  ) : (
                    <div className="el-avatar-placeholder">
                      {activeConversation?.participantName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="el-chat-header-details">
                  <h3>{activeConversation?.participantName}</h3>
                  <span className="el-chat-status">
                    <span className={'el-status-dot ' + (activeConversation?.isOnline ? 'online' : 'offline')} />
                    {activeConversation?.isOnline ? 'En ligne' : 'Hors ligne'}
                  </span>
                </div>
              </div>
              <div className="el-chat-header-actions">
                <button className="el-icon-btn" aria-label="Appel vocal">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </button>
                <button className="el-icon-btn" aria-label="Appel video">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                </button>
                <button className="el-icon-btn" aria-label="Plus d'options">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="19" cy="12" r="1" />
                    <circle cx="5" cy="12" r="1" />
                  </svg>
                </button>
              </div>
            </header>

            <main className="el-chat-messages" ref={messagesEndRef}>
              {conversation?.messages.length === 0 ? (
                <div className="el-chat-empty">
                  <p>Aucun message pour l'instant</p>
                  <p className="el-chat-empty-hint">Soyez le premier a envoyer un message !</p>
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => {
                    const showDate = index === 0 ||
                      formatDate(new Date(messages[index - 1].timestamp)) !== formatDate(new Date(msg.timestamp));
                    const isOwn = msg.senderId === 'current_user_id';

                    return (
                      <React.Fragment key={msg.id}>
                        {showDate && (
                          <div className="el-chat-date-separator" key={'date-' + msg.timestamp}>
                            <span>{formatDate(new Date(msg.timestamp))}</span>
                          </div>
                        )}
                        <div className={'el-message ' + (isOwn ? 'own' : '')}>
                          {!isOwn && (
                            <div className="el-message-avatar">
                              <div className="el-avatar-placeholder">
                                {msg.senderName.charAt(0).toUpperCase()}
                              </div>
                            </div>
                          )}
                          <div className="el-message-content">
                            <div className="el-message-header">
                              <span className="el-message-sender">{msg.senderName}</span>
                              <span className="el-message-time">{formatTime(msg.timestamp)}</span>
                            </div>
                            <div className={'el-message-bubble ' + msg.senderRole}>
                              <p>{msg.content}</p>
                              {msg.attachments && msg.attachments.length > 0 && (
                                <div className="el-message-attachments">
                                  {msg.attachments.map((att, i) => (
                                    <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="el-attachment">
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                        <line x1="10" y1="9" x2="8" y2="9" />
                                      </svg>
                                      <span>{att.url.split('/').pop()}</span>
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                            <span className="el-message-time">{formatTime(msg.timestamp)}</span>
                            {isOwn && msg.read && (
                              <span className="el-message-read">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M18 13l-5 5-4-4" />
                                </svg>
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </main>

                  <footer className="el-chat-input-area">
                    {attachments.length > 0 && (
                      <div className="el-chat-attachments-preview">
                        {attachments.map((file, index) => (
                          <div key={index} className="el-attachment-preview">
                            <span>{file.name}</span>
                            <button type="button" onClick={() => removeAttachment(index)} aria-label="Supprimer">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="el-chat-input-wrapper">
                      <button
                        type="button"
                        className="el-chat-attach-btn"
                        onClick={() => setShowAttachments(true)}
                        disabled={sending}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </button>
                      <div className="el-chat-input-wrapper">
                        <textarea
                          ref={inputRef}
                          className="el-chat-input"
                          placeholder="Ecrivez un message..."
                          value={messageInput}
                          onChange={e => setMessageInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          disabled={sending}
                          rows={1}
                          style={{ height: 'auto', minHeight: '44px', maxHeight: '150px' }}
                        />
                        <button
                          type="button"
                          className="el-btn el-btn-primary el-btn-icon"
                          onClick={handleSend}
                          disabled={sending || (!messageInput.trim() && attachments.length === 0)}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </footer>
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default Chat;
ENDFILE