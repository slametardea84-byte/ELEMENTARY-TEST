import 'dotenv/config';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { VERSUS_BANK } from './src/data/versusBank.ts';
import type {
  ActiveDuel,
  DuelChallenge,
  OnlinePlayer,
  TeacherBroadcast,
  VersusQuestion,
  WeatherKind,
} from './src/types/game.ts';

const PORT = Number(process.env.PORT || 3000);
const TEACHER_PASSWORD = process.env.TEACHER_ADMIN_PASSWORD || 'smpbhy07#123';

const app = express();
app.use(express.json({ limit: '512kb' }));

// In-memory authoritative server state for the shared 3D city
const activePlayers = new Map<string, OnlinePlayer>();
const socketSessions = new Map<WebSocket, string>();
const sessionSockets = new Map<string, WebSocket>();
const pendingChallenges = new Map<string, DuelChallenge>();
const activeDuels = new Map<string, ActiveDuel>();
const progressRecords = new Map<
  string,
  {
    key: string;
    name: string;
    school: string;
    className: string;
    role: string;
    totalScore: number;
    answeredCount: number;
    completedChapters: number;
    pvpWins: number;
    level: number;
    updatedAt: string;
  }
>();

const teacherBroadcast: TeacherBroadcast = {
  frozen: false,
  freezeMessage: 'Perhatian seluruh siswa! Mari kita diskusikan materi bersama.',
  announcement: '',
  announcementId: '',
  announcementTime: 0,
};

function pruneStalePlayers() {
  const cutoff = Date.now() - 25_000;
  for (const [sid, p] of activePlayers.entries()) {
    if (p.lastSeenMs < cutoff) {
      activePlayers.delete(sid);
    }
  }
  const challengeCutoff = Date.now() - 45_000;
  for (const [cid, ch] of pendingChallenges.entries()) {
    if (ch.createdAtMs < challengeCutoff) {
      pendingChallenges.delete(cid);
    }
  }
}

function getPlayersSnapshot(): OnlinePlayer[] {
  pruneStalePlayers();
  return Array.from(activePlayers.values());
}

function broadcastJson(payload: unknown) {
  const msg = JSON.stringify(payload);
  for (const ws of socketSessions.keys()) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  }
}

function sendToSession(sessionId: string, payload: unknown) {
  const ws = sessionSockets.get(sessionId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function pickRandomVersusQuestions(count = 8): VersusQuestion[] {
  const copy = [...VERSUS_BANK];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy.slice(0, count);
}

function mapWmoToWeather(code: number, tempC: number): WeatherKind {
  if (code >= 95) return 'Badai';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'Hujan';
  if (code >= 1 && code <= 48) return 'Berawan';
  if (tempC >= 32) return 'Terik';
  return 'Cerah';
}

// --- API Routes ---
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, playersOnline: getPlayersSnapshot().length, timestamp: Date.now() });
});

app.get('/api/weather', async (req, res) => {
  const rawLat = Number(req.query.lat);
  const rawLon = Number(req.query.lon);
  const lat = Number.isFinite(rawLat) && rawLat >= -90 && rawLat <= 90 ? rawLat : -6.2088;
  const lon = Number.isFinite(rawLon) && rawLon >= -180 && rawLon <= 180 ? rawLon : 106.8456;
  const locationLabel = Number.isFinite(rawLat) ? 'Lokasi Lokal Anda' : 'Indonesia (Default)';

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) {
      throw new Error(`Open-Meteo HTTP ${response.status}`);
    }
    const data = (await response.json()) as {
      current?: {
        temperature_2m?: number;
        weather_code?: number;
        wind_speed_10m?: number;
      };
    };
    const tempC = Math.round(data.current?.temperature_2m ?? 29);
    const code = Number(data.current?.weather_code ?? 0);
    const windKmh = Math.round(data.current?.wind_speed_10m ?? 8);
    res.json({
      condition: mapWmoToWeather(code, tempC),
      temperatureC: tempC,
      windKmh,
      source: 'open-meteo',
      locationLabel,
    });
  } catch {
    res.json({
      condition: 'Cerah' as WeatherKind,
      temperatureC: 29,
      windKmh: 7,
      source: 'open-meteo',
      locationLabel,
    });
  }
});

app.get('/api/multiplayer/players', (_req, res) => {
  res.json({
    players: getPlayersSnapshot(),
    broadcast: teacherBroadcast,
    serverTimeMs: Date.now(),
  });
});

app.post('/api/multiplayer/heartbeat', (req, res) => {
  const body = req.body as Partial<OnlinePlayer> | undefined;
  if (!body || typeof body.sessionId !== 'string' || !body.sessionId) {
    res.status(400).json({ error: 'Invalid sessionId' });
    return;
  }
  const existing = activePlayers.get(body.sessionId);
  const player: OnlinePlayer = {
    sessionId: body.sessionId.slice(0, 128),
    name: String(body.name || existing?.name || 'Siswa').slice(0, 80),
    school: String(body.school || existing?.school || 'SMP Nusantara').slice(0, 100),
    className: String(body.className || existing?.className || 'VIII').slice(0, 40),
    role: body.role === 'teacher' ? 'teacher' : 'student',
    avatar: body.avatar || existing?.avatar || {
      shirtColor: '#2563EB',
      pantsColor: '#1E293B',
      hairColor: '#1E1B18',
      hatColor: '#F59E0B',
      companion: 'owl',
    },
    x: Number.isFinite(body.x) ? Number(body.x) : existing?.x ?? 0,
    y: Number.isFinite(body.y) ? Number(body.y) : existing?.y ?? 0,
    z: Number.isFinite(body.z) ? Number(body.z) : existing?.z ?? 42,
    rotY: Number.isFinite(body.rotY) ? Number(body.rotY) : existing?.rotY ?? 0,
    animState: body.animState || existing?.animState || 'idle',
    level: Number.isFinite(body.level) ? Number(body.level) : existing?.level ?? 1,
    progressPct: Number.isFinite(body.progressPct) ? Number(body.progressPct) : existing?.progressPct ?? 0,
    buildingId: typeof body.buildingId === 'string' ? body.buildingId.slice(0, 64) : existing?.buildingId ?? '',
    lastSeenMs: Date.now(),
  };
  activePlayers.set(player.sessionId, player);

  // Also include any pending duel challenges for this session
  const incomingChallenges = Array.from(pendingChallenges.values()).filter(
    (c) => c.toSessionId === player.sessionId
  );

  res.json({
    players: getPlayersSnapshot(),
    broadcast: teacherBroadcast,
    incomingChallenges,
    serverTimeMs: Date.now(),
  });
});

app.post('/api/multiplayer/leave', (req, res) => {
  const sessionId = typeof req.body?.sessionId === 'string' ? req.body.sessionId : '';
  if (sessionId) {
    activePlayers.delete(sessionId);
    broadcastJson({ type: 'player:left', sessionId });
  }
  res.json({ ok: true });
});

app.post('/api/progress', (req, res) => {
  const b = req.body as Record<string, unknown>;
  const key = String(b?.key || '').slice(0, 128);
  if (!key) {
    res.status(400).json({ error: 'Missing progress key' });
    return;
  }
  progressRecords.set(key, {
    key,
    name: String(b.name || 'Siswa').slice(0, 80),
    school: String(b.school || 'SMP').slice(0, 100),
    className: String(b.className || 'VIII').slice(0, 40),
    role: b.role === 'teacher' ? 'teacher' : 'student',
    totalScore: Number(b.totalScore || 0),
    answeredCount: Number(b.answeredCount || 0),
    completedChapters: Number(b.completedChapters || 0),
    pvpWins: Number(b.pvpWins || 0),
    level: Number(b.level || 1),
    updatedAt: new Date().toISOString(),
  });
  res.json({ ok: true });
});

app.post('/api/teacher/verify', (req, res) => {
  const password = String(req.body?.password || '');
  if (password === TEACHER_PASSWORD) {
    res.json({ valid: true });
    return;
  }
  res.status(401).json({ valid: false, error: 'Sandi Mode Admin Guru salah.' });
});

app.get('/api/teacher/recap', (req, res) => {
  const password = String(req.query.password || '');
  if (password !== TEACHER_PASSWORD) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  res.json({
    records: Array.from(progressRecords.values()),
    onlinePlayers: getPlayersSnapshot(),
    broadcast: teacherBroadcast,
  });
});

app.post('/api/teacher/broadcast', (req, res) => {
  const { password, frozen, freezeMessage, announcement } = req.body as {
    password?: string;
    frozen?: boolean;
    freezeMessage?: string;
    announcement?: string;
  };
  if (password !== TEACHER_PASSWORD) {
    res.status(401).json({ error: 'Sandi Admin Guru tidak valid.' });
    return;
  }
  if (typeof frozen === 'boolean') {
    teacherBroadcast.frozen = frozen;
  }
  if (typeof freezeMessage === 'string' && freezeMessage.trim()) {
    teacherBroadcast.freezeMessage = freezeMessage.trim().slice(0, 280);
  }
  if (typeof announcement === 'string' && announcement.trim()) {
    teacherBroadcast.announcement = announcement.trim().slice(0, 280);
    teacherBroadcast.announcementId = `ann_${Date.now()}`;
    teacherBroadcast.announcementTime = Date.now();
  }
  broadcastJson({ type: 'broadcast:update', broadcast: teacherBroadcast });
  res.json({ ok: true, broadcast: teacherBroadcast });
});

// HTTP fallback for duel polling/actions
app.get('/api/duel/:duelId', (req, res) => {
  const duel = activeDuels.get(req.params.duelId);
  if (!duel) {
    res.status(404).json({ error: 'Duel not found' });
    return;
  }
  res.json({ duel });
});

app.post('/api/duel/challenge', (req, res) => {
  const { fromSessionId, fromName, fromSchool, toSessionId } = req.body as Partial<DuelChallenge>;
  if (!fromSessionId || !toSessionId) {
    res.status(400).json({ error: 'Invalid challenge participants' });
    return;
  }
  const challenge: DuelChallenge = {
    challengeId: `chl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    fromSessionId,
    fromName: String(fromName || 'Penantang'),
    fromSchool: String(fromSchool || 'SMP'),
    toSessionId,
    createdAtMs: Date.now(),
  };
  pendingChallenges.set(challenge.challengeId, challenge);
  sendToSession(toSessionId, { type: 'duel:challenge', challenge });
  res.json({ ok: true, challenge });
});

app.post('/api/duel/respond', (req, res) => {
  const { challengeId, accept, responderSessionId, responderName } = req.body as {
    challengeId: string;
    accept: boolean;
    responderSessionId: string;
    responderName: string;
  };
  const challenge = pendingChallenges.get(challengeId);
  if (!challenge) {
    res.status(404).json({ error: 'Challenge expired' });
    return;
  }
  pendingChallenges.delete(challengeId);
  if (!accept) {
    sendToSession(challenge.fromSessionId, {
      type: 'duel:declined',
      challengeId,
      byName: responderName,
    });
    res.json({ accepted: false });
    return;
  }
  const duelId = `duel_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const duel: ActiveDuel = {
    duelId,
    mode: 'pvp',
    status: 'active',
    questions: pickRandomVersusQuestions(8),
    challenger: {
      sessionId: challenge.fromSessionId,
      name: challenge.fromName,
      score: 0,
      answeredCount: 0,
    },
    opponent: {
      sessionId: responderSessionId,
      name: responderName,
      score: 0,
      answeredCount: 0,
    },
    startedAtMs: Date.now(),
    winnerSessionId: null,
  };
  activeDuels.set(duelId, duel);
  sendToSession(challenge.fromSessionId, { type: 'duel:started', duel });
  sendToSession(responderSessionId, { type: 'duel:started', duel });
  res.json({ accepted: true, duel });
});

app.post('/api/duel/answer', (req, res) => {
  const { duelId, sessionId, questionIndex, optionIndex } = req.body as {
    duelId: string;
    sessionId: string;
    questionIndex: number;
    optionIndex: number;
  };
  const duel = activeDuels.get(duelId);
  if (!duel) {
    res.status(404).json({ error: 'Duel not found' });
    return;
  }
  const q = duel.questions[questionIndex];
  const isCorrect = q ? q.correctIndex === optionIndex : false;
  const participant =
    duel.challenger.sessionId === sessionId
      ? duel.challenger
      : duel.opponent.sessionId === sessionId
        ? duel.opponent
        : null;
  if (participant && participant.answeredCount === questionIndex) {
    participant.answeredCount += 1;
    if (isCorrect) participant.score += 15;
  }
  if (
    duel.challenger.answeredCount >= duel.questions.length &&
    duel.opponent.answeredCount >= duel.questions.length
  ) {
    duel.status = 'finished';
    if (duel.challenger.score > duel.opponent.score) {
      duel.winnerSessionId = duel.challenger.sessionId;
    } else if (duel.opponent.score > duel.challenger.score) {
      duel.winnerSessionId = duel.opponent.sessionId;
    } else {
      duel.winnerSessionId = 'draw';
    }
  }
  sendToSession(duel.challenger.sessionId, { type: 'duel:update', duel });
  sendToSession(duel.opponent.sessionId, { type: 'duel:update', duel });
  res.json({ duel, isCorrect });
});

// Create HTTP server & attach WebSocket
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(String(raw)) as { type: string; [key: string]: unknown };
      if (msg.type === 'player:join' || msg.type === 'player:move') {
        const p = msg.player as Partial<OnlinePlayer> | undefined;
        if (!p || !p.sessionId) return;
        socketSessions.set(ws, p.sessionId);
        sessionSockets.set(p.sessionId, ws);
        const existing = activePlayers.get(p.sessionId);
        const merged: OnlinePlayer = {
          sessionId: p.sessionId,
          name: String(p.name || existing?.name || 'Siswa').slice(0, 80),
          school: String(p.school || existing?.school || 'SMP').slice(0, 100),
          className: String(p.className || existing?.className || 'VIII').slice(0, 40),
          role: p.role === 'teacher' ? 'teacher' : 'student',
          avatar: p.avatar || existing?.avatar || {
            shirtColor: '#2563EB',
            pantsColor: '#1E293B',
            hairColor: '#1E1B18',
            hatColor: '#F59E0B',
            companion: 'owl',
          },
          x: Number(p.x ?? existing?.x ?? 0),
          y: Number(p.y ?? existing?.y ?? 0),
          z: Number(p.z ?? existing?.z ?? 42),
          rotY: Number(p.rotY ?? existing?.rotY ?? 0),
          animState: (p.animState as OnlinePlayer['animState']) || existing?.animState || 'idle',
          level: Number(p.level ?? existing?.level ?? 1),
          progressPct: Number(p.progressPct ?? existing?.progressPct ?? 0),
          buildingId: String(p.buildingId ?? existing?.buildingId ?? ''),
          lastSeenMs: Date.now(),
        };
        activePlayers.set(merged.sessionId, merged);
        if (msg.type === 'player:join') {
          ws.send(
            JSON.stringify({
              type: 'city:init',
              players: getPlayersSnapshot(),
              broadcast: teacherBroadcast,
            })
          );
        }
        broadcastJson({ type: 'player:update', player: merged });
      } else if (msg.type === 'duel:challenge') {
        const challenge: DuelChallenge = {
          challengeId: `chl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          fromSessionId: String(msg.fromSessionId || ''),
          fromName: String(msg.fromName || 'Penantang'),
          fromSchool: String(msg.fromSchool || 'SMP'),
          toSessionId: String(msg.toSessionId || ''),
          createdAtMs: Date.now(),
        };
        if (challenge.fromSessionId && challenge.toSessionId) {
          pendingChallenges.set(challenge.challengeId, challenge);
          sendToSession(challenge.toSessionId, { type: 'duel:challenge', challenge });
        }
      } else if (msg.type === 'duel:respond') {
        const challengeId = String(msg.challengeId || '');
        const challenge = pendingChallenges.get(challengeId);
        if (!challenge) return;
        pendingChallenges.delete(challengeId);
        if (!msg.accept) {
          sendToSession(challenge.fromSessionId, {
            type: 'duel:declined',
            challengeId,
            byName: String(msg.responderName || ''),
          });
          return;
        }
        const duelId = `duel_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const duel: ActiveDuel = {
          duelId,
          mode: 'pvp',
          status: 'active',
          questions: pickRandomVersusQuestions(8),
          challenger: {
            sessionId: challenge.fromSessionId,
            name: challenge.fromName,
            score: 0,
            answeredCount: 0,
          },
          opponent: {
            sessionId: String(msg.responderSessionId || challenge.toSessionId),
            name: String(msg.responderName || 'Lawan'),
            score: 0,
            answeredCount: 0,
          },
          startedAtMs: Date.now(),
          winnerSessionId: null,
        };
        activeDuels.set(duelId, duel);
        sendToSession(duel.challenger.sessionId, { type: 'duel:started', duel });
        sendToSession(duel.opponent.sessionId, { type: 'duel:started', duel });
      } else if (msg.type === 'duel:answer') {
        const duel = activeDuels.get(String(msg.duelId || ''));
        if (!duel) return;
        const sid = String(msg.sessionId || '');
        const qIdx = Number(msg.questionIndex ?? -1);
        const optIdx = Number(msg.optionIndex ?? -1);
        const q = duel.questions[qIdx];
        const isCorrect = q ? q.correctIndex === optIdx : false;
        const participant =
          duel.challenger.sessionId === sid
            ? duel.challenger
            : duel.opponent.sessionId === sid
              ? duel.opponent
              : null;
        if (participant && participant.answeredCount === qIdx) {
          participant.answeredCount += 1;
          if (isCorrect) participant.score += 15;
        }
        if (
          duel.challenger.answeredCount >= duel.questions.length &&
          duel.opponent.answeredCount >= duel.questions.length
        ) {
          duel.status = 'finished';
          if (duel.challenger.score > duel.opponent.score) {
            duel.winnerSessionId = duel.challenger.sessionId;
          } else if (duel.opponent.score > duel.challenger.score) {
            duel.winnerSessionId = duel.opponent.sessionId;
          } else {
            duel.winnerSessionId = 'draw';
          }
        }
        sendToSession(duel.challenger.sessionId, { type: 'duel:update', duel });
        sendToSession(duel.opponent.sessionId, { type: 'duel:update', duel });
      }
    } catch {
      // ignore malformed frames
    }
  });

  ws.on('close', () => {
    const sid = socketSessions.get(ws);
    socketSessions.delete(ws);
    if (sid) {
      if (sessionSockets.get(sid) === ws) {
        sessionSockets.delete(sid);
      }
      activePlayers.delete(sid);
      broadcastJson({ type: 'player:left', sessionId: sid });
    }
  });
});

// Setup Vite in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve('dist/index.html'));
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve('dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`EduCity 3D server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
