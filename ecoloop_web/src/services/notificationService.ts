import { eventManager } from './eventManager';

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: Array<{ action: string; title: string; icon?: string }>;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'payment' | 'collection' | 'message';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: Record<string, any>;
  actionUrl?: string;
  actionLabel?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'producteur' | 'collecteur' | 'industriel' | 'mairie' | 'admin';
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: Array<{ url: string; type: 'image' | 'document' | 'image' }>;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

type NotificationCallback = (notification: Notification) => void;
type ConversationCallback = (conversation: Conversation) => void;
type MessageCallback = (message: ChatMessage) => void;

class NotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private pushSubscription: PushSubscription | null = null;
  private vapidPublicKey: string = '';
  private notificationPermission: NotificationPermission = 'default';
  private eventSource: EventSource | null = null;
  private listeners = new Map<string, Set<Function>>();
  private userId: string | null = null;
  private token: string | null = null;
  private baseUrl: string;

  constructor(baseUrl = '/api/v1') {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.notificationPermission = Notification.permission;
      this.init();
    }
  }

  private async init() {
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.ready;
        console.log('[Notifications] Service Worker ready');
      } catch (err) {
        console.warn('[Notifications] Service Worker not ready:', err);
      }
    }

    if ('Notification' in window) {
      this.notificationPermission = Notification.permission;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('[Notifications] Not supported');
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    this.notificationPermission = permission;
    
    if (permission === 'granted') {
      await this.subscribeToPush();
    }

    return permission;
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      console.warn('[Notifications] No SW registration');
      return null;
    }

    try {
      const existing = await this.swRegistration.pushManager.getSubscription();
      if (existing) {
        this.pushSubscription = existing;
        return existing;
      }

      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
      });

      this.pushSubscription = subscription;
      console.log('[Notifications] Push subscription created');
      
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (err) {
      console.error('[Notifications] Push subscription failed:', err);
      return null;
    }
  }

  setVapidPublicKey(key: string) {
    this.vapidPublicKey = key;
  }

  private async sendSubscriptionToServer(subscription: PushSubscription) {
    try {
      await fetch(`${this.baseUrl}/notifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
            auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
          },
        },
      });
    } catch (err) {
      console.warn('[Notifications] Failed to send subscription to server:', err);
    }
  }

  async showNotification(payload: NotificationPayload): Promise<Notification | null> {
    if (this.notificationPermission !== 'granted') {
      console.warn('[Notifications] Permission not granted');
      return null;
    }

    if (!this.swRegistration) {
      console.warn('[Notifications] No SW registration');
      return null;
    }

    try {
      const notification = await this.swRegistration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icon-192.png',
        badge: payload.badge || '/badge-72.png',
        tag: payload.tag,
        data: payload.data,
        actions: payload.actions,
        requireInteraction: payload.requireInteraction ?? false,
        silent: payload.silent ?? false,
        timestamp: payload.timestamp ?? Date.now(),
        vibrate: [200, 100, 200],
      });

      return notification;
    } catch (err) {
      console.error('[Notifications] Failed to show notification:', err);
      return null;
    }
  }

  async notify(title: string, body: string, options?: Partial<NotificationPayload>) {
    return this.showNotification({ title, body, ...options });
  }

  async notifyCollectionValidated(lotId: string, collectorName: string) {
    return this.showNotification({
      title: 'Collecte validée ✅',
      body: `${collectorName} a validé la collecte de votre lot`,
      tag: `collection-${lotId}`,
      data: { lotId, type: 'collection_validated' },
      actions: [
        { action: 'view', title: 'Voir les détails' },
        { action: 'dismiss', title: 'Ignorer' },
      ],
      requireInteraction: true,
    });
  }

  async notifyPaymentReceived(amount: number, currency: string) {
    return this.showNotification({
      title: 'Paiement reçu 💰',
      body: `Vous avez reçu ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount)}`,
      tag: 'payment-received',
      data: { type: 'payment_received', amount },
      actions: [
        { action: 'view', title: 'Voir le reçu' },
      ],
    });
  }

  async notifyNewMessage(senderName: string, preview: string, conversationId: string) {
    return this.showNotification({
      title: `Nouveau message de ${senderName}`,
      body: preview.length > 50 ? preview.slice(0, 50) + '…' : preview,
      tag: `message-${conversationId}`,
      data: { conversationId, type: 'new_message' },
      actions: [
        { action: 'reply', title: 'Répondre' },
        { action: 'view', title: 'Voir la conversation' },
      ],
    });
  }

  async notifyCollectionRequested(lotId: string, producerName: string, material: string, weight: number) {
    return this.showNotification({
      title: 'Nouvelle demande de collecte ♻️',
      body: `${producerName} propose ${material} (${weight} kg)`,
      tag: `collection-${lotId}`,
      data: { lotId, type: 'collection_requested' },
      actions: [
        { action: 'accept', title: 'Accepter' },
        { action: 'view', title: 'Voir les détails' },
      ],
      requireInteraction: true,
    });
  }

  async notifyPaymentRequest(lotId: string, amount: number) {
    return this.showNotification({
      title: 'Demande de paiement 💰',
      body: `Un paiement de ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount)} est en attente`,
      tag: `payment-${lotId}`,
      data: { lotId, type: 'payment_request' },
      actions: [
        { action: 'pay', title: 'Payer maintenant' },
        { action: 'view', title: 'Voir les détails' },
      ],
      requireInteraction: true,
    });
  }

  connectSSE(onMessage: (data: any) => void, onError?: (err: Error) => void) {
    if (this.eventSource) {
      this.eventSource.close();
    }

    const url = `${this.baseUrl}/notifications/stream`;
    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.warn('[SSE] Parse error:', err);
      }
    };

    this.eventSource.onerror = (err) => {
      console.error('[SSE] Connection error:', err);
      onError?.(new Error('SSE connection error'));
      
      setTimeout(() => this.connectSSE(onMessage, onError), 5000);
    };

    return this.eventSource;
  }

  closeSSE() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  on(event: 'notification' | 'message' | 'conversation_update' | 'typing' | 'read_receipt' | 'user_status', callback: Function) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }

  async getNotifications(unreadOnly = false): Promise<Notification[]> {
    const params = new URLSearchParams({ unread_only: String(unreadOnly) });
    const res = await fetch(`${this.baseUrl}/notifications?${params}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return res.json();
  }

  async markAsRead(notificationId: string): Promise<void> {
    await fetch(`${this.baseUrl}/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${this.token}` },
    });
  }

  async markAllAsRead(): Promise<void> {
    await fetch(`${this.baseUrl}/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${this.token}` },
    });
  }

  async getConversations(): Promise<Conversation[]> {
    const res = await fetch(`${this.baseUrl}/chat/conversations`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return res.json();
  }

  async getMessages(conversationId: string, limit = 50, before?: string): Promise<ChatMessage[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (before) params.append('before', before);
    const res = await fetch(`${this.baseUrl}/chat/conversations/${conversationId}/messages?${params}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return res.json();
  }

  async sendMessage(conversationId: string, content: string, attachments?: File[]): Promise<ChatMessage> {
    const formData = new FormData();
    formData.append('content', content);
    if (attachments) attachments.forEach(f => formData.append('attachments', f));

    const res = await fetch(`${this.baseUrl}/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}` },
      body: formData,
    });
    return res.json();
  }

  async markConversationAsRead(conversationId: string): Promise<void> {
    await fetch(`${this.baseUrl}/chat/conversations/${conversationId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${this.token}` },
    });
  }

  async startConversation(participantId: string, initialMessage?: string): Promise<Conversation> {
    const res = await fetch(`${this.baseUrl}/chat/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ participant_id: participantId, initial_message: initialMessage }),
    });
    return res.json();
  }

  sendTyping(conversationId: string, isTyping: boolean) {
    // WebSocket message for typing indicator
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'typing',
        conversation_id: conversationId,
        is_typing: isTyping,
      }));
    }
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }
}

let notificationServiceInstance: NotificationService | null = null;

export function getNotificationService(): NotificationService {
  if (!notificationServiceInstance) {
    notificationServiceInstance = new NotificationService();
  }
  return notificationServiceInstance;
}

export function initializeNotifications(userId: string, token: string) {
  const service = getNotificationService();
  service.initialize(userId, token);
  return service;
}

// ============ React Hooks ============

import { useState, useEffect, useCallback } from 'react';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const service = getNotificationService();

    const load = async () => {
      setLoading(true);
      try {
        const data = await service.getNotifications();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    load();

    const unsubscribe = service.on('notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icon-192.png',
          tag: notification.id,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    const service = getNotificationService();
    await service.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    const service = getNotificationService();
    await service.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const service = getNotificationService();

    const load = async () => {
      setLoading(true);
      try {
        const data = await service.getConversations();
        setConversations(data);
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    load();

    const unsub1 = service.on('conversation_update', (conversation: Conversation) => {
      setConversations(prev => {
        const idx = prev.findIndex(c => c.id === conversation.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = conversation;
          return next;
        }
        return [conversation, ...prev];
      });
    });

    const unsub2 = service.on('message', (message: ChatMessage) => {
      setConversations(prev => prev.map(c => {
        if (c.id === message.conversationId) {
          return {
            ...c,
            lastMessage: message.content,
            lastMessageTime: message.timestamp,
            unreadCount: c.unreadCount + 1,
          };
        }
        return c;
      }));
    });

    return () => { unsub1(); unsub2(); };
  }, []);

  return { conversations, loading };
}

export function useConversation(conversationId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [typing, setTyping] = useState<Record<string, boolean>>({});

  const service = getNotificationService();

  useEffect(() => {
    if (!conversationId) return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await service.getMessages(conversationId);
        setMessages(data);
        setHasMore(data.length >= 50);
        await service.markConversationAsRead(conversationId);
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoading(false);
      }
    };

    load();

    const unsub1 = service.on('message', (msg: ChatMessage) => {
      if (msg.conversationId === conversationId) {
        setMessages(prev => [...prev, msg]);
      }
    });

    const unsub2 = service.on('read_receipt', (data: { conversationId: string; messageIds: string[] }) => {
      if (data.conversationId === conversationId) {
        setMessages(prev => prev.map(m =>
          data.messageIds.includes(m.id) ? { ...m, read: true } : m
        ));
      }
    });

    const unsub3 = service.on('typing', (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (data.conversationId === conversationId) {
        setTyping(prev => ({ ...prev, [data.userId]: data.isTyping }));
      }
    });

    return () => { unsub1(); unsub2(); unsub3(); };
  }, [conversationId]);

  const sendMessage = useCallback(async (content: string, attachments?: File[]) => {
    try {
      const msg = await service.sendMessage(conversationId, content, attachments);
      setMessages(prev => [...prev, msg]);
      return msg;
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    }
  }, [conversationId, service]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || messages.length === 0) return;
    setLoading(true);
    try {
      const before = messages[0].timestamp;
      const data = await service.getMessages(conversationId, 50, before);
      if (data.length > 0) {
        setMessages(prev => [...data, ...prev]);
        setHasMore(data.length >= 50);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more messages:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId, messages, loading, hasMore, service]);

  const setTypingStatus = useCallback((isTyping: boolean) => {
    service.sendTyping(conversationId, isTyping);
  }, [conversationId, service]);

  return { messages, loading, hasMore, typing, sendMessage, loadMore, setTypingStatus };
}

// ============ PWA Service Worker Registration ============

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[PWA] Service Worker registered:', registration.scope);
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] New version available');
              window.dispatchEvent(new CustomEvent('pwa-update-available'));
            }
          });
        }
      });

      return registration;
    } catch (err) {
      console.error('[PWA] Service Worker registration failed:', err);
    }
  }
  return null;
}

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return Promise.resolve('denied');
  }
  return Notification.requestPermission();
}

export function showLocalNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/favicon.ico',
      badge: '/badge-72.png',
      ...options,
    });
  }
  return null;
}

export function checkOnlineStatus(): boolean {
  return navigator.onLine;
}

export function useOnlineStatus() {
  const [online, setOnline] = useState(checkOnlineStatus());

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return online;
}

export function usePWAUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setUpdateAvailable(true);
    window.addEventListener('pwa-update-available', handleUpdate);
    return () => window.removeEventListener('pwa-update-available', handleUpdate);
  }, []);

  const applyUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  };

  return { updateAvailable, applyUpdate };
}

// ============ Offline Queue for Pending Actions ============

interface QueuedAction {
  id: string;
  type: 'payment' | 'message' | 'collection' | 'validation';
  payload: any;
  timestamp: number;
  retries: number;
}

const OFFLINE_QUEUE_KEY = 'ecoloop_offline_queue';

export function getOfflineQueue(): QueuedAction[] {
  try {
    const data = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addToOfflineQueue(action: Omit<QueuedAction, 'id' | 'timestamp' | 'retries'>) {
  const queue = getOfflineQueue();
  queue.push({
    ...action,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    retries: 0,
  });
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then(reg => {
      (reg as any).sync.register('ecoloop-sync');
    });
  }
}

export function removeFromOfflineQueue(id: string) {
  const queue = getOfflineQueue().filter(a => a.id !== id);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export function processOfflineQueue(): Promise<void> {
  const queue = getOfflineQueue();
  if (queue.length === 0) return Promise.resolve();

  return new Promise(resolve => {
    const processNext = async (index: number) => {
      if (index >= queue.length) {
        localStorage.setItem(OFFLINE_QUEUE_KEY, '[]');
        resolve();
        return;
      }

      const action = queue[index];
      try {
        switch (action.type) {
          case 'payment':
            // await processPayment(action.payload);
            break;
          case 'message':
            // await sendMessage(action.payload);
            break;
          case 'collection':
            // await submitCollection(action.payload);
            break;
          case 'validation':
            // await validateCollection(action.payload);
            break;
        }
        queue.splice(index, 1);
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
        processNext(index);
      } catch (err) {
        action.retries++;
        if (action.retries >= 3) {
          queue.splice(index, 1);
        }
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
        processNext(index + 1);
      }
    };

    processNext(0);
  };
}