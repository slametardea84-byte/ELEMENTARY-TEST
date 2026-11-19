import { useRef, useState } from 'react';
import {
  Cloud,
  CloudLightning,
  CloudRain,
  Compass,
  Maximize2,
  Minimize2,
  Palette,
  Shield,
  Sun,
  Swords,
  Users,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { ARENA_VERSUS_POSITION, CHAPTERS, TOTAL_CHAPTER_QUESTIONS } from '../data/chaptersAndQuestions';
import type {
  DayPhase,
  OnlinePlayer,
  PlayerProgress,
  PlayerSession,
  WeatherKind,
  WeatherState,
} from '../types/game';
import type { NearbyPrompt, SpectatorState } from './GameCanvas3D';

interface CityHUDProps {
  session: PlayerSession;
  progress: PlayerProgress;
  playerPos: { x: number; z: number };
  onlinePlayers: OnlinePlayer[];
  currentBuildingId: string;
  nearbyPrompt: NearbyPrompt | null;
  weather: WeatherState;
  dayPhase: DayPhase;
  localTimeStr: string;
  dayPhaseOverride: DayPhase | 'auto';
  audioEnabled: boolean;
  isFullscreenMobile: boolean;
  spectator: SpectatorState;
  onTeleport: (x: number, z: number) => void;
  onInteract: (prompt: NearbyPrompt) => void;
  onExitBuilding: () => void;
  onOpenAvatarStudio: () => void;
  onOpenTeacherAdmin: () => void;
  onToggleAudio: () => void;
  onToggleMobileFullscreen: () => void;
  onWeatherOverride: (cond: WeatherKind) => void;
  onDayPhaseOverride: (phase: DayPhase | 'auto') => void;
  onChallengePlayer: (target: OnlinePlayer) => void;
  onJoystickMove: (dx: number, dy: number) => void;
  onJumpPointerDown: () => void;
  onJumpPointerUp: () => void;
  onSprintToggle: (sprint: boolean) => void;
  onStopSpectator: () => void;
}

const WEATHER_OPTIONS: WeatherKind[] = ['Cerah', 'Berawan', 'Hujan', 'Badai', 'Terik'];
const PHASE_OPTIONS: Array<DayPhase | 'auto'> = ['auto', 'Pagi', 'Siang', 'Sore', 'Malam'];

export function CityHUD({
  session,
  progress,
  playerPos,
  onlinePlayers,
  currentBuildingId,
  nearbyPrompt,
  weather,
  dayPhase,
  localTimeStr,
  dayPhaseOverride,
  audioEnabled,
  isFullscreenMobile,
  spectator,
  onTeleport,
  onInteract,
  onExitBuilding,
  onOpenAvatarStudio,
  onOpenTeacherAdmin,
  onToggleAudio,
  onToggleMobileFullscreen,
  onWeatherOverride,
  onDayPhaseOverride,
  onChallengePlayer,
  onJoystickMove,
  onJumpPointerDown,
  onJumpPointerUp,
  onSprintToggle,
  onStopSpectator,
}: CityHUDProps) {
  const [showOnlineList, setShowOnlineList] = useState(false);
  const [showWeatherMenu, setShowWeatherMenu] = useState(false);
  const [sprintActive, setSprintActive] = useState(false);

  // Analog Joystick state
  const joyBaseRef = useRef<HTMLDivElement | null>(null);
  const [joyKnob, setJoyKnob] = useState({ x: 0, y: 0 });
  const joyPointerId = useRef<number | null>(null);

  const handleJoyDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    joyPointerId.current = e.pointerId;
    updateJoystick(e.clientX, e.clientY);
  };

  const handleJoyMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (joyPointerId.current !== e.pointerId) return;
    updateJoystick(e.clientX, e.clientY);
  };

  const handleJoyUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (joyPointerId.current !== e.pointerId) return;
    joyPointerId.current = null;
    setJoyKnob({ x: 0, y: 0 });
    onJoystickMove(0, 0);
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    const el = joyBaseRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxR = rect.width * 0.38;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }
    setJoyKnob({ x: dx, y: dy });
    onJoystickMove(dx / maxR, dy / maxR);
  };

  const toggleMobileSprint = () => {
    const next = !sprintActive;
    setSprintActive(next);
    onSprintToggle(next);
  };

  // Minimap coordinate mapping: world [-70..70] -> [0..100]%
  const mapCoord = (val: number) => {
    const pct = ((val + 72) / 144) * 100;
    return Math.max(6, Math.min(94, pct));
  };

  const WeatherIcon =
    weather.condition === 'Badai'
      ? CloudLightning
      : weather.condition === 'Hujan'
        ? CloudRain
        : weather.condition === 'Berawan'
          ? Cloud
          : Sun;

  const isTeacher = session.role === 'teacher';

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-2.5 sm:p-4 select-none">
      {/* TOP BAR */}
      <div className="flex items-start justify-between gap-2">
        {/* TOP-LEFT: GTA-Style Minimap Radar (Always visible, even in Mobile Fullscreen!) */}
        <div className="pointer-events-auto flex flex-col gap-1.5">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-slate-900/92 border-2 border-slate-700 shadow-xl relative overflow-hidden">
            {/* Road Crosshairs */}
            <div className="absolute left-1/2 top-0 bottom-0 w-3 -translate-x-1/2 bg-slate-700/80" />
            <div className="absolute top-[41%] left-0 right-0 h-2.5 bg-slate-700/80" />

            {/* Arena Versus Icon (Clickable Teleport) */}
            <button
              type="button"
              onClick={() => onTeleport(ARENA_VERSUS_POSITION.x, ARENA_VERSUS_POSITION.z + 15)}
              title="Teleport ke Arena Versus 1v1"
              style={{
                left: `${mapCoord(ARENA_VERSUS_POSITION.x)}%`,
                top: `${mapCoord(ARENA_VERSUS_POSITION.z)}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border border-amber-300 text-[9px] font-bold text-white flex items-center justify-center cursor-pointer hover:scale-125 transition-transform"
            >
              VS
            </button>

            {/* 5 Chapter Buildings (Clickable Teleport) */}
            {CHAPTERS.map((ch) => {
              const done = progress.completedChapterIds.includes(ch.id);
              const portalX = ch.position.x + Math.sin(ch.position.facing) * 11;
              const portalZ = ch.position.z + Math.cos(ch.position.facing) * 11;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => onTeleport(portalX, portalZ)}
                  title={`Teleport ke ${ch.buildingName}`}
                  style={{
                    left: `${mapCoord(ch.position.x)}%`,
                    top: `${mapCoord(ch.position.z)}%`,
                    backgroundColor: done ? '#f59e0b' : ch.accentHex,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded text-[9px] font-bold text-white border border-white/80 flex items-center justify-center cursor-pointer hover:scale-125 transition-transform"
                >
                  {ch.number}
                </button>
              );
            })}

            {/* Other Online Players (Green Dots) */}
            {onlinePlayers
              .filter((p) => p.sessionId !== session.sessionId)
              .map((p) => (
                <span
                  key={p.sessionId}
                  title={`${p.name} (${p.className})`}
                  style={{
                    left: `${mapCoord(p.x)}%`,
                    top: `${mapCoord(p.z)}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-950"
                />
              ))}

            {/* Local Player Marker */}
            <span
              style={{
                left: `${mapCoord(playerPos.x)}%`,
                top: `${mapCoord(playerPos.z)}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-sky-500 shadow"
            />
            <span className="absolute bottom-1 left-2 text-[10px] font-semibold text-slate-300">
              Radar Kota (Klik Teleport)
            </span>
          </div>

          {!isFullscreenMobile && (
            <div className="bg-slate-900/92 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 flex items-center gap-2">
              <span className="font-bold text-amber-300 font-mono-num">Lv.{progress.level}</span>
              <span className="text-slate-400">·</span>
              <span className="font-mono-num">{progress.answeredCorrectIds.length}/{TOTAL_CHAPTER_QUESTIONS} Soal</span>
              <span className="text-slate-400">·</span>
              <span className="font-mono-num text-emerald-300">{progress.totalScore} Poin</span>
            </div>
          )}

          {/* Teacher Spectator Indicator (ONLY shown to Teacher Admin when active) */}
          {isTeacher && spectator.mode !== 'off' && (
            <button
              type="button"
              onClick={onStopSpectator}
              className="pointer-events-auto bg-amber-500 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl shadow cursor-pointer"
            >
              Spectator Aktif ({spectator.mode === 'free' ? 'Terbang Bebas' : 'Ikuti Siswa'}) · Keluar
            </button>
          )}
        </div>

        {/* TOP-RIGHT: Controls Cluster (Hidden in Mobile Fullscreen except "Normal" button!) */}
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <div className="flex items-center flex-wrap justify-end gap-1.5 sm:gap-2">
            {!isFullscreenMobile && (
              <>
                {/* Weather & Real-Time Clock Toggle */}
                <button
                  type="button"
                  onClick={() => setShowWeatherMenu((v) => !v)}
                  className="h-9 px-2.5 sm:px-3 rounded-xl bg-slate-900/92 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-100 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <WeatherIcon className="w-4 h-4 text-amber-300" />
                  <span className="font-mono-num">{localTimeStr}</span>
                  <span className="hidden sm:inline text-slate-300">· {dayPhase} · {weather.condition} {weather.temperatureC}°C</span>
                </button>

                {/* Studio Avatar */}
                <button
                  type="button"
                  onClick={onOpenAvatarStudio}
                  className="h-9 px-2.5 sm:px-3 rounded-xl bg-slate-900/92 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-100 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Palette className="w-4 h-4 text-sky-400" />
                  <span className="hidden sm:inline">Studio Avatar</span>
                </button>

                {/* Online Players List */}
                <button
                  type="button"
                  onClick={() => setShowOnlineList((v) => !v)}
                  className="h-9 px-2.5 sm:px-3 rounded-xl bg-slate-900/92 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-300 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span className="font-mono-num">Online ({onlinePlayers.length})</span>
                </button>

                {/* Audio Toggle */}
                <button
                  type="button"
                  onClick={onToggleAudio}
                  aria-label="Toggle Musik & Pemandu Suara"
                  className="h-9 w-9 rounded-xl bg-slate-900/92 hover:bg-slate-800 border border-slate-700 text-slate-100 inline-flex items-center justify-center cursor-pointer"
                >
                  {audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
                </button>

                {/* Teacher Admin Panel Button (ONLY rendered for role === 'teacher') */}
                {isTeacher && (
                  <button
                    type="button"
                    onClick={onOpenTeacherAdmin}
                    className="h-9 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Guru</span>
                  </button>
                )}
              </>
            )}

            {/* Mobile Fullscreen / Normal Toggle (Small screens) */}
            <button
              type="button"
              onClick={onToggleMobileFullscreen}
              className="lg:hidden h-9 px-3 rounded-xl bg-slate-900/92 border border-sky-400/60 text-xs font-bold text-sky-300 inline-flex items-center gap-1.5 cursor-pointer"
            >
              {isFullscreenMobile ? (
                <>
                  <Minimize2 className="w-4 h-4" />
                  <span>Normal</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" />
                  <span>Layar Penuh</span>
                </>
              )}
            </button>
          </div>

          {/* Weather & Time Manual Override Popover */}
          {showWeatherMenu && !isFullscreenMobile && (
            <div className="w-72 bg-slate-900 border border-slate-700 rounded-2xl p-3.5 shadow-2xl space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Cuaca & Jam Dunia 3D</span>
                <button
                  type="button"
                  onClick={() => setShowWeatherMenu(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  Tutup
                </button>
              </div>
              <div className="text-slate-300">
                Sumber Cuaca: <strong className="text-sky-300">{weather.source === 'open-meteo' ? 'Open-Meteo Live' : 'Manual'}</strong> ({weather.locationLabel})
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Mode Cuaca</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {WEATHER_OPTIONS.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => onWeatherOverride(w)}
                      className={`py-1.5 rounded-lg font-semibold cursor-pointer ${
                        weather.condition === w
                          ? 'bg-sky-500 text-slate-950'
                          : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Waktu Lokal</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {PHASE_OPTIONS.map((ph) => (
                    <button
                      key={ph}
                      type="button"
                      onClick={() => onDayPhaseOverride(ph)}
                      className={`py-1.5 rounded-lg font-semibold cursor-pointer ${
                        dayPhaseOverride === ph
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      {ph === 'auto' ? 'Jam Lokal' : ph}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Online Players Panel */}
          {showOnlineList && !isFullscreenMobile && (
            <div className="w-80 max-h-80 overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl p-3.5 shadow-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="font-bold text-white">Pemain di Kota ({onlinePlayers.length})</span>
                <button
                  type="button"
                  onClick={() => setShowOnlineList(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  Tutup
                </button>
              </div>
              {onlinePlayers.map((p) => {
                const isMe = p.sessionId === session.sessionId;
                const dist = Math.round(Math.hypot(p.x - playerPos.x, p.z - playerPos.z));
                return (
                  <div
                    key={p.sessionId}
                    className="p-2.5 rounded-xl bg-slate-800/85 border border-slate-700 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate">
                        {p.role === 'teacher' ? `GURU · ${p.name}` : p.name}{' '}
                        {isMe && <span className="text-sky-400">(Anda)</span>}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {p.school} · {p.className} · Lv.{p.level} {!isMe && `· ${dist}m`}
                      </div>
                    </div>
                    {!isMe && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onTeleport(p.x + 2.5, p.z + 2.5);
                            setShowOnlineList(false);
                          }}
                          title="Kunjungi lokasi pemain"
                          className="px-2 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>Kunjungi</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onChallengePlayer(p)}
                          title="Tantang Duel 1v1"
                          className="px-2 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Swords className="w-3.5 h-3.5" />
                          <span>Duel</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Building Interior Back Button */}
          {currentBuildingId && currentBuildingId !== 'arena-versus' && !isFullscreenMobile && (
            <button
              type="button"
              onClick={onExitBuilding}
              className="h-9 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
            >
              Keluar ke Kota 3D
            </button>
          )}
        </div>
      </div>

      {/* CENTER-BOTTOM CONTEXTUAL INTERACTION PROMPT (Desktop + Touch) */}
      {nearbyPrompt && (
        <div className="pointer-events-auto self-center mb-2">
          <button
            type="button"
            onClick={() => onInteract(nearbyPrompt)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm shadow-xl border-2 cursor-pointer transition-transform active:scale-95 ${
              nearbyPrompt.isArena
                ? 'bg-red-600 hover:bg-red-500 border-amber-300 text-white'
                : 'bg-sky-500 hover:bg-sky-400 border-white text-slate-950'
            }`}
          >
            {nearbyPrompt.label} (Tekan E / Ketuk)
          </button>
        </div>
      )}

      {/* BOTTOM CONTROLS: Mobile Joystick + Jump/Action AND Desktop Key Legend */}
      <div className="flex items-end justify-between gap-4">
        {/* Left-Bottom: Mobile Analog Joystick + Lari Toggle */}
        <div className="pointer-events-auto flex items-end gap-2.5 lg:hidden">
          <div
            ref={joyBaseRef}
            onPointerDown={handleJoyDown}
            onPointerMove={handleJoyMove}
            onPointerUp={handleJoyUp}
            onPointerCancel={handleJoyUp}
            className="touch-none-select w-28 h-28 rounded-full bg-slate-900/75 border-2 border-slate-500/70 relative flex items-center justify-center"
          >
            <div
              style={{
                transform: `translate(${joyKnob.x}px, ${joyKnob.y}px)`,
              }}
              className="w-12 h-12 rounded-full bg-sky-400 border-2 border-white shadow-lg"
            />
          </div>
          <button
            type="button"
            onClick={toggleMobileSprint}
            className={`h-11 px-3.5 rounded-xl font-bold text-xs border-2 inline-flex items-center gap-1 cursor-pointer ${
              sprintActive
                ? 'bg-amber-400 border-white text-slate-950'
                : 'bg-slate-900/85 border-slate-600 text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Lari</span>
          </button>
        </div>

        {/* Desktop Compact Key Hint Bar */}
        <div className="hidden lg:flex mx-auto bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-200 items-center gap-3 shadow-lg">
          <span><strong className="text-sky-300">WASD / Panah</strong> Jalan</span>
          <span className="text-slate-600">·</span>
          <span><strong className="text-sky-300">Shift</strong> Lari</span>
          <span className="text-slate-600">·</span>
          <span><strong className="text-sky-300">Spasi</strong> Lompat</span>
          <span className="text-slate-600">·</span>
          <span><strong className="text-sky-300">Seret Mouse / Scroll</strong> Kamera 360° & Zoom</span>
          <span className="text-slate-600">·</span>
          <span><strong className="text-amber-300">E / Enter</strong> Masuk & Interaksi</span>
        </div>

        {/* Right-Bottom: Mobile Instant Jump (pointerdown) + Action */}
        <div className="pointer-events-auto flex items-end gap-2.5 lg:hidden">
          {nearbyPrompt && (
            <button
              type="button"
              onPointerDown={() => onInteract(nearbyPrompt)}
              className="touch-none-select h-14 px-4 rounded-2xl bg-emerald-500 border-2 border-white text-slate-950 font-extrabold text-xs shadow-xl active:scale-95"
            >
              Aksi
            </button>
          )}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onJumpPointerDown();
            }}
            onPointerUp={onJumpPointerUp}
            onPointerCancel={onJumpPointerUp}
            className="touch-none-select w-20 h-20 rounded-full bg-amber-400 border-2 border-white text-slate-950 font-extrabold text-sm shadow-xl active:scale-95"
          >
            Lompat
          </button>
        </div>
      </div>
    </div>
  );
}
