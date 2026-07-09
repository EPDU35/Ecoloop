import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List
from uuid import uuid4

logger = logging.getLogger("ecoloop.events")


class EventManager:
    def __init__(self, max_events: int = 100):
        self._subscribers: List[asyncio.Queue] = []
        self._history: List[Dict[str, Any]] = []
        self._max_events = max_events

    def subscribe(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue()
        self._subscribers.append(q)
        return q

    def unsubscribe(self, q: asyncio.Queue):
        if q in self._subscribers:
            self._subscribers.remove(q)

    async def publish(self, event_type: str, data: Any, source: str = "system"):
        event = {
            "id": str(uuid4()),
            "type": event_type,
            "source": source,
            "data": data,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        self._history.append(event)
        if len(self._history) > self._max_events:
            self._history = self._history[-self._max_events:]

        dead: List[asyncio.Queue] = []
        for q in self._subscribers:
            try:
                q.put_nowait(event)
            except asyncio.QueueFull:
                dead.append(q)
        for q in dead:
            self.unsubscribe(q)

    def get_recent(self, limit: int = 20) -> List[Dict[str, Any]]:
        return self._history[-limit:]


event_manager = EventManager()
