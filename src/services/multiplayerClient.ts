import type {
  ActiveDuel,
  DuelChallenge,
  OnlinePlayer,
  TeacherBroadcast,
} from '../types/game';
import {
  removeFirestorePresence,
  subscribeFirestorePresence,
  upsertFirestorePresence,
} from './firebase';

type ListenerMap = {
  players: (players: OnlinePlayer[]) => void;
  broadcast: (broadcast: TeacherBroadcast) => void;
  challenge: (challenge: DuelChallenge) => void;
  duelStarted: (duel: ActiveDuel) => void;
  duelUpdate: (duel: ActiveDuel) => void;
  duelDeclined: (byName: string) => void;
};

export function getOrCreateTabSessionId(): string {
  const key = 'educity_tab_session_id';
  let existing = sessionStorage.getItem(key);
  if (!existing) {
    existing = `tab_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(key, existing);
  }
  return existing;
}

export class MultiplayerClient {
  private ws: WebSocket | null = null;
  private localPlayer: OnlinePlayer | null = null;
  private wsPlayers = new Map<string, OnlinePlayer>();
  private firestorePlayers = new Map<string, OnlinePlayer>();
  private heartbeatTimer: number | null = null;
  private firestoreTimer: number | null = null;
  private reconnectTimer: number | null = null;
  private unsubFirestore: (() => void) | null = null;
  private listeners: Partial<ListenerMap> = {};
  private lastWsSendMs = 0;
  private stopped = false;

  public start(player: OnlinePlayer, listeners: Partial<ListenerMap>): void {
    this.stopped = false;
    this.localPlayer = player;
    this.listeners = listeners;

    this.connectWebSocket();
    this.startHttpHeartbeat();
    this.startFirestorePresenceSync();

    window.addEventListener('beforeunload', this.handleUnload);
  }

  public stop(): void {
    this.stopped = true;
    window.removeEventListener('beforeunload', this.handleUnload);
    if (this.heartbeatTimer !== null) window.clearInterval(this.heartbeatTimer);
    if (this.firestoreTimer !== null) window.clearInterval(this.firestoreTimer);
    if (this.reconnectTimer !== null) window.clearTimeout(this.reconnectTimer);
    this.heartbeatTimer = null;
    this.firestoreTimer = null;
    this.reconnectTimer = null;
    if (this.unsubFirestore) {
      this.unsubFirestore();
      this.unsubFirestore = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.localPlayer) {
      removeFirestorePresence(this.localPlayer.sessionId);
    }
  }

  private handleUnload = (): void => {
    if (!this.localPlayer) return;
    const payload = JSON.stringify({ sessionId: this.localPlayer.sessionId });
    navigator.sendBeacon('/api/multiplayer/leave', new Blob([payload], { type: 'application/json' }));
    removeFirestorePresence(this.localPlayer.sessionId);
  };

  public updateLocalState(partial: Partial<OnlinePlayer>): void {
    if (!this.localPlayer) return;
    this.localPlayer = {
      ...this.localPlayer,
      ...partial,
      lastSeenMs: Date.now(),
    };

    const now = performance.now();
    if (this.ws && this.ws.readyState === WebSocket.OPEN && now - this.lastWsSendMs > 70) {
      this.lastWsSendMs = now;
      this.ws.send(JSON.stringify({ type: 'player:move', player: this.localPlayer }));
    }
  }

  private emitMergedPlayers(): void {
    const merged = new Map<string, OnlinePlayer>();
    const cutoff = Date.now() - 28_000;
    for (const p of this.firestorePlayers.values()) {
      if (p.lastSeenMs >= cutoff) merged.set(p.sessionId, p);
    }
    for (const p of this.wsPlayers.values()) {
      if (p.lastSeenMs >= cutoff) {
        const existing = merged.get(p.sessionId);
        if (!existing || p.lastSeenMs >= existing.lastSeenMs) {
          merged.set(p.sessionId, p);
        }
      }
    }
    if (this.localPlayer) {
      merged.set(this.localPlayer.sessionId, this.localPlayer);
    }
    this.listeners.players?.(Array.from(merged.values()));
  }

  private connectWebSocket(): void {
    if (this.stopped) return;
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${proto}//${window.location.host}/ws`;
    try {
      const ws = new WebSocket(wsUrl);
      this.ws = ws;

      ws.onopen = () => {
        if (this.localPlayer) {
          ws.send(JSON.stringify({ type: 'player:join', player: this.localPlayer }));
        }
      };

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(String(ev.data)) as { type: string; [key: string]: unknown };
          if (msg.type === 'city:init') {
            const players = (msg.players as OnlinePlayer[]) || [];
            this.wsPlayers.clear();
            players.forEach((p) => this.wsPlayers.set(p.sessionId, p));
            this.emitMergedPlayers();
            if (msg.broadcast) {
              this.listeners.broadcast?.(msg.broadcast as TeacherBroadcast);
            }
          } else if (msg.type === 'player:update') {
            const p = msg.player as OnlinePlayer;
            if (p?.sessionId) {
              this.wsPlayers.set(p.sessionId, p);
              this.emitMergedPlayers();
            }
          } else if (msg.type === 'player:left') {
            const sid = String(msg.sessionId || '');
            this.wsPlayers.delete(sid);
            this.firestorePlayers.delete(sid);
            this.emitMergedPlayers();
          } else if (msg.type === 'broadcast:update') {
            if (msg.broadcast) {
              this.listeners.broadcast?.(msg.broadcast as TeacherBroadcast);
            }
          } else if (msg.type === 'duel:challenge') {
            if (msg.challenge) {
              this.listeners.challenge?.(msg.challenge as DuelChallenge);
            }
          } else if (msg.type === 'duel:started') {
            if (msg.duel) {
              this.listeners.duelStarted?.(msg.duel as ActiveDuel);
            }
          } else if (msg.type === 'duel:update') {
            if (msg.duel) {
              this.listeners.duelUpdate?.(msg.duel as ActiveDuel);
            }
          } else if (msg.type === 'duel:declined') {
            this.listeners.duelDeclined?.(String(msg.byName || 'Lawan'));
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (!this.stopped) {
          this.reconnectTimer = window.setTimeout(() => this.connectWebSocket(), 2500);
        }
      };
    } catch {
      // HTTP heartbeat fallback handles sync seamlessly
    }
  }

  private startHttpHeartbeat(): void {
    const beat = async () => {
      if (!this.localPlayer || this.stopped) return;
      try {
        const res = await fetch('/api/multiplayer/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.localPlayer),
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          players?: OnlinePlayer[];
          broadcast?: TeacherBroadcast;
          incomingChallenges?: DuelChallenge[];
        };
        if (Array.isArray(data.players)) {
          data.players.forEach((p) => this.wsPlayers.set(p.sessionId, p));
          this.emitMergedPlayers();
        }
        if (data.broadcast) {
          this.listeners.broadcast?.(data.broadcast);
        }
        if (Array.isArray(data.incomingChallenges) && data.incomingChallenges.length > 0) {
          this.listeners.challenge?.(data.incomingChallenges[0]);
        }
      } catch {
        // ignore transient network errors
      }
    };
    beat();
    this.heartbeatTimer = window.setInterval(beat, 2000);
  }

  private startFirestorePresenceSync(): void {
    if (!this.localPlayer) return;
    upsertFirestorePresence(this.localPlayer);
    this.firestoreTimer = window.setInterval(() => {
      if (this.localPlayer && !this.stopped) {
        upsertFirestorePresence(this.localPlayer);
      }
    }, 4500);

    this.unsubFirestore = subscribeFirestorePresence((players) => {
      this.firestorePlayers.clear();
      players.forEach((p) => this.firestorePlayers.set(p.sessionId, p));
      this.emitMergedPlayers();
    });
  }

  public async sendDuelChallenge(toSessionId: string): Promise<void> {
    if (!this.localPlayer) return;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'duel:challenge',
          fromSessionId: this.localPlayer.sessionId,
          fromName: this.localPlayer.name,
          fromSchool: this.localPlayer.school,
          toSessionId,
        })
      );
      return;
    }
    await fetch('/api/duel/challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromSessionId: this.localPlayer.sessionId,
        fromName: this.localPlayer.name,
        fromSchool: this.localPlayer.school,
        toSessionId,
      }),
    });
  }

  public async respondDuelChallenge(challengeId: string, accept: boolean): Promise<ActiveDuel | null> {
    if (!this.localPlayer) return null;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'duel:respond',
          challengeId,
          accept,
          responderSessionId: this.localPlayer.sessionId,
          responderName: this.localPlayer.name,
        })
      );
      return null;
    }
    const res = await fetch('/api/duel/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        challengeId,
        accept,
        responderSessionId: this.localPlayer.sessionId,
        responderName: this.localPlayer.name,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { duel?: ActiveDuel };
    return data.duel || null;
  }

  public async submitDuelAnswer(
    duelId: string,
    questionIndex: number,
    optionIndex: number
  ): Promise<ActiveDuel | null> {
    if (!this.localPlayer) return null;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'duel:answer',
          duelId,
          sessionId: this.localPlayer.sessionId,
          questionIndex,
          optionIndex,
        })
      );
      return null;
    }
    const res = await fetch('/api/duel/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        duelId,
        sessionId: this.localPlayer.sessionId,
        questionIndex,
        optionIndex,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { duel?: ActiveDuel };
    return data.duel || null;
  }
}
