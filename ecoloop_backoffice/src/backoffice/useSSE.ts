import { useEffect, useRef, useCallback } from 'react';

type EventCallback = (event: any) => void;

export function useSSE(
  url: string,
  onEvent: EventCallback,
  enabled: boolean = true
) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const onEventRef = useRef<EventCallback>(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    if (eventSourceRef.current) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const fullUrl = `${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`;
    const es = new EventSource(fullUrl);
    eventSourceRef.current = es;

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        onEventRef.current(data);
      } catch { }
    };

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
      setTimeout(connect, 3000);
    };
  }, [url]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) connect();
    else disconnect();
    return disconnect;
  }, [enabled, connect, disconnect]);

  return { connect, disconnect };
}
