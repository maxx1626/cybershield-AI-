import { SimulationStatus } from '../types';

type MessageHandler = (status: SimulationStatus) => void;

class SimulationSocketService {
  private ws: WebSocket | null = null;
  private handlers: Set<MessageHandler> = new Set();
  private reconnectTimer: any = null;

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/simulation`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        // Connected
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'SIMULATION_UPDATE' && msg.data) {
            this.handlers.forEach((handler) => handler(msg.data));
          }
        } catch {
          // ignore
        }
      };

      this.ws.onclose = () => {
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        if (this.ws) {
          this.ws.close();
        }
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, 3000);
  }

  subscribe(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    this.connect();
    return () => {
      this.handlers.delete(handler);
    };
  }

  send(action: string, payload: any = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action, ...payload }));
    }
  }
}

export const socketService = new SimulationSocketService();

