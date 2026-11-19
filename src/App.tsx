import { Component, type ErrorInfo, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Bell, PauseCircle, Swords } from 'lucide-react';
import { AvatarStudioModal } from './components/AvatarStudioModal';
import { BuildingStationModal } from './components/BuildingStationModal';
import { CityHUD } from './components/CityHUD';
import { EntryScreen } from './components/EntryScreen';
import {
  GameCanvas3D,
  type GameCanvasHandle,
  type NearbyPrompt,
  type SpectatorState,
} from './components/GameCanvas3D';
import { TeacherAdminModal } from './components/TeacherAdminModal';
import { VersusArenaModal } from './components/VersusArenaModal';
import { CHAPTERS, TOTAL_CHAPTER_QUESTIONS } from './data/chaptersAndQuestions';
import { audioGuide } from './services/audioGuide';
import {
  loadStudentProgressCloud,
  saveStudentProgressCloud,
  saveUserProfile,
  testFirestoreConnection,
} from './services/firebase';
import { MultiplayerClient } from './services/multiplayerClient';
import type {
  ActiveDuel,
  AvatarCustomization,
  DayPhase,
  DuelChallenge,
  OnlinePlayer,
  PlayerProgress,
  PlayerSession,
  TeacherBroadcast,
  WeatherKind,
  WeatherState,
} from './types/game';

const PROGRESS_STORAGE_KEY = 'educity_progress_v1';

const DEFAULT_PROGRESS: PlayerProgress = {
  answeredCorrectIds: [],
  completedChapterIds: [],
  reflections: {},
  totalScore: 0,
  pvpWins: 0,
  level: 1,
};

function computeLevel(totalScore: number, correctCount: number): number {
  return Math.max(1, 1 + Math.floor((totalScore + correctCount * 10) / 50));
}

function loadLocalProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<PlayerProgress>;
    return {
      answeredCorrectIds: Array.isArray(parsed.answeredCorrectIds) ? parsed.answeredCorrectIds : [],
      completedChapterIds: Array.isArray(parsed.completedChapterIds) ? parsed.completedChapterIds : [],
      reflections: parsed.reflections && typeof parsed.reflections === 'object' ? parsed.reflections : {},
      totalScore: Number(parsed.totalScore || 0),
      pvpWins: Number(parsed.pvpWins || 0),
      level: Number(parsed.level || 1),
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class AppErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, message: '' };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('EduCity ErrorBoundary:', error, info);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] bg-slate-950 text-white flex items-center justify-center p-6">
          <div className="max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl p-6 space-y-3">
            <h2 className="text-lg font-bold text-rose-300">Terjadi Gangguan Aplikasi</h2>
            <p className="text-xs text-slate-300 break-words">{this.state.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs cursor-pointer"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function EduCityApp() {
  const [session, setSession] = useState<PlayerSession | null>(null);
  const [progress, setProgress] = useState<PlayerProgress>(loadLocalProgress);
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const [playerPos, setPlayerPos] = useState({ x: 0, z: 30 });
  const [currentBuildingId, setCurrentBuildingId] = useState('');
  const [nearbyPrompt, setNearbyPrompt] = useState<NearbyPrompt | null>(null);

  // Modals
  const [showAvatarStudio, setShowAvatarStudio] = useState(false);
  const [showTeacherAdmin, setShowTeacherAdmin] = useState(false);
  const [activeStationModal, setActiveStationModal] = useState<{
    chapterId: string;
    station: 'video' | 'quiz' | 'sheet';
  } | null>(null);
  const [showVersusModal, setShowVersusModal] = useState(false);

  // Weather & Real-Time Local Clock
  const [weather, setWeather] = useState<WeatherState>({
    condition: 'Cerah',
    temperatureC: 29,
    windKmh: 8,
    source: 'open-meteo',
    locationLabel: 'Indonesia',
  });
  const [dayPhase, setDayPhase] = useState<DayPhase>('Siang');
  const [localTimeStr, setLocalTimeStr] = useState('12:00');
  const [dayPhaseOverride, setDayPhaseOverride] = useState<DayPhase | 'auto'>('auto');

  // Audio & Mobile Fullscreen
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isFullscreenMobile, setIsFullscreenMobile] = useState(false);

  // Teacher Broadcasts & Spectator (Spectator strictly for role === 'teacher')
  const [broadcast, setBroadcast] = useState<TeacherBroadcast>({
    frozen: false,
    freezeMessage: '',
    announcement: '',
    announcementId: '',
    announcementTime: 0,
  });
  const [toastAnnouncement, setToastAnnouncement] = useState<string | null>(null);
  const [kickNotice, setKickNotice] = useState<string | null>(null);
  const kickNoticeTimerRef = useRef<number | null>(null);
  const lastAnnouncementIdRef = useRef('');
  const [spectator, setSpectator] = useState<SpectatorState>({ mode: 'off', targetSessionId: null });

  // 1v1 PvP Duels
  const [incomingChallenge, setIncomingChallenge] = useState<DuelChallenge | null>(null);
  const [activeDuel, setActiveDuel] = useState<ActiveDuel | null>(null);

  const canvasRef = useRef<GameCanvasHandle | null>(null);
  const mpRef = useRef<MultiplayerClient | null>(null);
  const gameRootRef = useRef<HTMLDivElement | null>(null);

  // Startup Firestore connection validation
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Fetch real weather from Open-Meteo via server endpoint
  useEffect(() => {
    if (!session) return;
    const fetchWeather = async (lat?: number, lon?: number) => {
      try {
        const qs = lat !== undefined && lon !== undefined ? `?lat=${lat}&lon=${lon}` : '';
        const res = await fetch(`/api/weather${qs}`);
        if (res.ok) {
          const data = (await res.json()) as WeatherState;
          setWeather(data);
        }
      } catch {
        // Keep current weather
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(),
        { timeout: 3500 }
      );
    } else {
      fetchWeather();
    }
  }, [session]);

  const syncProgressEverywhere = useCallback(
    (nextProgress: PlayerProgress, activeSession: PlayerSession) => {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(nextProgress));
      if (activeSession.uid) {
        saveStudentProgressCloud(activeSession, nextProgress).catch(() => {});
      }
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: activeSession.uid || activeSession.sessionId,
          name: activeSession.name,
          school: activeSession.school,
          className: activeSession.className,
          role: activeSession.role,
          totalScore: nextProgress.totalScore,
          answeredCount: nextProgress.answeredCorrectIds.length,
          completedChapters: nextProgress.completedChapterIds.length,
          pvpWins: nextProgress.pvpWins,
          level: nextProgress.level,
        }),
      }).catch(() => {});
      mpRef.current?.updateLocalState({
        level: nextProgress.level,
        progressPct: Math.min(
          100,
          Math.round((nextProgress.answeredCorrectIds.length / TOTAL_CHAPTER_QUESTIONS) * 100)
        ),
      });
    },
    []
  );

  // Enter city handler
  const handleEnterCity = async (newSession: PlayerSession) => {
    setSession(newSession);
    audioGuide.unlockAndStartMusic();

    let resolvedProgress = loadLocalProgress();
    if (newSession.uid) {
      saveUserProfile(newSession).catch(() => {});
      try {
        const cloud = await loadStudentProgressCloud(newSession.uid);
        if (cloud && cloud.answeredCorrectIds.length >= resolvedProgress.answeredCorrectIds.length) {
          resolvedProgress = cloud;
        }
      } catch {
        // fallback to local progress
      }
    }
    setProgress(resolvedProgress);
    syncProgressEverywhere(resolvedProgress, newSession);

    const mp = new MultiplayerClient();
    mpRef.current = mp;
    mp.start(
      {
        sessionId: newSession.sessionId,
        name: newSession.name,
        school: newSession.school,
        className: newSession.className,
        role: newSession.role,
        avatar: newSession.avatar,
        x: 0,
        y: 0,
        z: 30,
        rotY: Math.PI,
        animState: 'idle',
        level: resolvedProgress.level,
        progressPct: Math.min(
          100,
          Math.round((resolvedProgress.answeredCorrectIds.length / TOTAL_CHAPTER_QUESTIONS) * 100)
        ),
        buildingId: '',
        lastSeenMs: Date.now(),
      },
      {
        players: (list) => setOnlinePlayers(list),
        broadcast: (nextB) => {
          setBroadcast(nextB);
          if (
            nextB.announcementId &&
            nextB.announcementId !== lastAnnouncementIdRef.current &&
            nextB.announcement
          ) {
            lastAnnouncementIdRef.current = nextB.announcementId;
            setToastAnnouncement(nextB.announcement);
            audioGuide.speak(`Pengumuman dari Guru: ${nextB.announcement}`, 'id-ID');
            window.setTimeout(() => setToastAnnouncement(null), 9000);
          }
        },
        challenge: (ch) => setIncomingChallenge(ch),
        duelStarted: (duel) => {
          setIncomingChallenge(null);
          setActiveDuel(duel);
          setShowVersusModal(true);
        },
        duelUpdate: (duel) => setActiveDuel(duel),
        duelDeclined: (byName) => {
          setToastAnnouncement(`${byName} menolak tantangan duel saat ini.`);
          window.setTimeout(() => setToastAnnouncement(null), 4000);
        },
      }
    );
  };

  useEffect(() => {
    return () => {
      mpRef.current?.stop();
      if (kickNoticeTimerRef.current !== null) {
        window.clearTimeout(kickNoticeTimerRef.current);
      }
    };
  }, []);

  const handlePlayerMove = useCallback(
    (state: { x: number; y: number; z: number; rotY: number; animState: OnlinePlayer['animState'] }) => {
      setPlayerPos((prev) =>
        Math.abs(prev.x - state.x) > 0.3 || Math.abs(prev.z - state.z) > 0.3
          ? { x: state.x, z: state.z }
          : prev
      );
      mpRef.current?.updateLocalState({
        ...state,
        buildingId: currentBuildingId,
      });
    },
    [currentBuildingId]
  );

  const handleInteract = useCallback(
    (prompt: NearbyPrompt) => {
      if (prompt.type === 'portal') {
        audioGuide.playPortalSfx();
        if (prompt.isArena) {
          setShowVersusModal(true);
          return;
        }
        setCurrentBuildingId(prompt.id);
        mpRef.current?.updateLocalState({ buildingId: prompt.id });
        const ch = CHAPTERS.find((c) => c.id === prompt.id);
        if (ch) {
          audioGuide.speak(`Memasuki ${ch.title}`, 'id-ID');
        }
      } else if (prompt.type === 'station') {
        if (prompt.id === 'exit') {
          audioGuide.playPortalSfx();
          setCurrentBuildingId('');
          mpRef.current?.updateLocalState({ buildingId: '' });
          canvasRef.current?.exitBuilding();
        } else if (
          prompt.id === 'video' ||
          prompt.id === 'quiz' ||
          prompt.id === 'sheet'
        ) {
          setActiveStationModal({
            chapterId: currentBuildingId || 'bab-1',
            station: prompt.id,
          });
        }
      }
    },
    [currentBuildingId]
  );

  const handleAnswerCorrect = (questionId: string, chapterId: string) => {
    if (!session) return;
    setProgress((prev) => {
      if (prev.answeredCorrectIds.includes(questionId)) return prev;
      const nextCorrect = [...prev.answeredCorrectIds, questionId];
      const ch = CHAPTERS.find((c) => c.id === chapterId);
      const chCompleted =
        ch && ch.questions.every((q) => nextCorrect.includes(q.id))
          ? Array.from(new Set([...prev.completedChapterIds, chapterId]))
          : prev.completedChapterIds;
      const nextScore = prev.totalScore + 10;
      const nextLevel = computeLevel(nextScore, nextCorrect.length);
      const updated: PlayerProgress = {
        ...prev,
        answeredCorrectIds: nextCorrect,
        completedChapterIds: chCompleted,
        totalScore: nextScore,
        level: nextLevel,
      };
      syncProgressEverywhere(updated, session);
      return updated;
    });
  };

  const handleSaveReflection = (chapterId: string, reflection: string) => {
    if (!session) return;
    setProgress((prev) => {
      const updated: PlayerProgress = {
        ...prev,
        reflections: {
          ...prev.reflections,
          [chapterId]: reflection,
        },
      };
      syncProgressEverywhere(updated, session);
      return updated;
    });
  };

  const handleKickFromBuilding = useCallback((chapterId: string, questionNumber: number) => {
    const ch = CHAPTERS.find((c) => c.id === chapterId);
    const chTitle = ch ? ch.title : 'Gedung Bab';
    setActiveStationModal(null);
    setCurrentBuildingId('');
    mpRef.current?.updateLocalState({ buildingId: '' });
    canvasRef.current?.exitBuilding();
    audioGuide.playPortalSfx();
    setKickNotice(
      `Jawaban Soal No.${questionNumber} salah! Kamu dikeluarkan dari ${chTitle}. Masuk kembali ke gedung untuk mencoba lagi.`
    );
    if (kickNoticeTimerRef.current !== null) {
      window.clearTimeout(kickNoticeTimerRef.current);
    }
    kickNoticeTimerRef.current = window.setTimeout(() => {
      kickNoticeTimerRef.current = null;
      setKickNotice(null);
    }, 5500);
  }, []);

  const handleDuelVictory = useCallback(
    (won: boolean) => {
      if (!session) return;
      setProgress((prev) => {
        const nextScore = prev.totalScore + (won ? 25 : 10);
        const nextWins = prev.pvpWins + (won ? 1 : 0);
        const updated: PlayerProgress = {
          ...prev,
          totalScore: nextScore,
          pvpWins: nextWins,
          level: computeLevel(nextScore, prev.answeredCorrectIds.length),
        };
        syncProgressEverywhere(updated, session);
        return updated;
      });
    },
    [session, syncProgressEverywhere]
  );

  const handleAvatarSave = (nextAvatar: AvatarCustomization) => {
    if (!session) return;
    const updatedSession = { ...session, avatar: nextAvatar };
    setSession(updatedSession);
    mpRef.current?.updateLocalState({ avatar: nextAvatar });
    if (updatedSession.uid) {
      saveUserProfile(updatedSession).catch(() => {});
    }
  };

  const handleToggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    audioGuide.setMusicEnabled(next);
    audioGuide.setVoiceEnabled(next);
  };

  const handleToggleMobileFullscreen = () => {
    const next = !isFullscreenMobile;
    setIsFullscreenMobile(next);
    if (next && gameRootRef.current && document.fullscreenElement === null) {
      gameRootRef.current.requestFullscreen?.().catch(() => {});
    } else if (!next && document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  if (!session) {
    return <EntryScreen onEnterCity={handleEnterCity} />;
  }

  const activeChapter =
    CHAPTERS.find((c) => c.id === activeStationModal?.chapterId) || CHAPTERS[0];

  return (
    <div
      ref={gameRootRef}
      className="relative w-full h-[100dvh] overflow-hidden bg-slate-950"
    >
      {/* 3D World Canvas */}
      <GameCanvas3D
        ref={canvasRef}
        session={session}
        progress={progress}
        onlinePlayers={onlinePlayers}
        currentBuildingId={currentBuildingId}
        weatherCondition={weather.condition}
        dayPhaseOverride={dayPhaseOverride}
        spectator={session.role === 'teacher' ? spectator : { mode: 'off', targetSessionId: null }}
        frozen={broadcast.frozen && session.role !== 'teacher'}
        onPlayerMove={handlePlayerMove}
        onNearbyChange={setNearbyPrompt}
        onInteract={handleInteract}
        onDayPhaseComputed={(phase, timeStr) => {
          setDayPhase(phase);
          setLocalTimeStr(timeStr);
        }}
      />

      {/* 100dvh HUD (Zero backdrop-blur over WebGL) */}
      <CityHUD
        session={session}
        progress={progress}
        playerPos={playerPos}
        onlinePlayers={onlinePlayers}
        currentBuildingId={currentBuildingId}
        nearbyPrompt={nearbyPrompt}
        weather={weather}
        dayPhase={dayPhase}
        localTimeStr={localTimeStr}
        dayPhaseOverride={dayPhaseOverride}
        audioEnabled={audioEnabled}
        isFullscreenMobile={isFullscreenMobile}
        spectator={session.role === 'teacher' ? spectator : { mode: 'off', targetSessionId: null }}
        onTeleport={(x, z) => {
          setCurrentBuildingId('');
          mpRef.current?.updateLocalState({ buildingId: '' });
          canvasRef.current?.teleportTo(x, z);
        }}
        onInteract={handleInteract}
        onExitBuilding={() => {
          setCurrentBuildingId('');
          mpRef.current?.updateLocalState({ buildingId: '' });
          canvasRef.current?.exitBuilding();
        }}
        onOpenAvatarStudio={() => setShowAvatarStudio(true)}
        onOpenTeacherAdmin={() => {
          if (session.role === 'teacher') {
            setShowTeacherAdmin(true);
          }
        }}
        onToggleAudio={handleToggleAudio}
        onToggleMobileFullscreen={handleToggleMobileFullscreen}
        onWeatherOverride={(cond: WeatherKind) =>
          setWeather((prev) => ({ ...prev, condition: cond, source: 'manual' }))
        }
        onDayPhaseOverride={setDayPhaseOverride}
        onChallengePlayer={(target) => {
          mpRef.current?.sendDuelChallenge(target.sessionId);
          setToastAnnouncement(`Tantangan duel 1v1 dikirim ke ${target.name}!`);
          window.setTimeout(() => setToastAnnouncement(null), 4000);
        }}
        onJoystickMove={(dx, dy) => canvasRef.current?.setJoystickInput(dx, dy)}
        onJumpPointerDown={() => canvasRef.current?.setJumpHeld(true)}
        onJumpPointerUp={() => canvasRef.current?.setJumpHeld(false)}
        onSprintToggle={(s) => canvasRef.current?.setMobileSprint(s)}
        onStopSpectator={() => setSpectator({ mode: 'off', targetSessionId: null })}
      />

      {/* Live Teacher Announcement Toast */}
      {toastAnnouncement && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 max-w-md w-[90%] bg-amber-500 text-slate-950 rounded-2xl px-4 py-3 shadow-2xl border-2 border-white flex items-center gap-3">
          <Bell className="w-5 h-5 shrink-0" />
          <div className="text-xs sm:text-sm font-bold">{toastAnnouncement}</div>
        </div>
      )}

      {/* Kick Notification Toast (Student wrong answer) */}
      {kickNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 max-w-md w-[90%] bg-rose-600 text-white rounded-2xl px-4 py-3 shadow-2xl border-2 border-rose-200 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-200" />
          <div className="text-xs sm:text-sm font-bold">{kickNotice}</div>
        </div>
      )}

      {/* Teacher Freeze Screen Overlay (Students only) */}
      {broadcast.frozen && session.role !== 'teacher' && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-slate-900 border-2 border-amber-400 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <PauseCircle className="w-12 h-12 text-amber-400 mx-auto" />
            <h2 className="text-xl font-extrabold text-white">Layar Dijeda oleh Guru untuk Diskusi</h2>
            <p className="text-sm text-slate-200 leading-relaxed">{broadcast.freezeMessage}</p>
            <div className="text-xs text-slate-400">
              Menunggu Guru mengaktifkan kembali pergerakan siswa...
            </div>
          </div>
        </div>
      )}

      {/* Incoming 1v1 PvP Challenge Banner */}
      {incomingChallenge && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[92%] bg-slate-900 border-2 border-red-500 rounded-2xl p-4 shadow-2xl space-y-3">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <Swords className="w-5 h-5 text-red-400" />
            <span>Tantangan Duel 1v1!</span>
          </div>
          <p className="text-xs text-slate-200">
            <strong>{incomingChallenge.fromName}</strong> ({incomingChallenge.fromSchool}) menantang Anda berduel Bahasa Inggris!
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                const duel = await mpRef.current?.respondDuelChallenge(
                  incomingChallenge.challengeId,
                  true
                );
                setIncomingChallenge(null);
                if (duel) {
                  setActiveDuel(duel);
                  setShowVersusModal(true);
                }
              }}
              className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer"
            >
              Terima Duel
            </button>
            <button
              type="button"
              onClick={() => {
                mpRef.current?.respondDuelChallenge(incomingChallenge.challengeId, false);
                setIncomingChallenge(null);
              }}
              className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer"
            >
              Tolak
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAvatarStudio && (
        <AvatarStudioModal
          current={session.avatar}
          onSave={handleAvatarSave}
          onClose={() => setShowAvatarStudio(false)}
        />
      )}

      {activeStationModal && (
        <BuildingStationModal
          chapter={activeChapter}
          initialStation={activeStationModal.station}
          session={session}
          progress={progress}
          onAnswerCorrect={handleAnswerCorrect}
          onSaveReflection={handleSaveReflection}
          onKickFromBuilding={handleKickFromBuilding}
          onClose={() => setActiveStationModal(null)}
        />
      )}

      {showVersusModal && (
        <VersusArenaModal
          session={session}
          onlinePlayers={onlinePlayers}
          activeDuel={activeDuel}
          onChallengePlayer={(sid) => mpRef.current?.sendDuelChallenge(sid)}
          onSubmitPvpAnswer={async (duelId, qIdx, optIdx) => {
            const updated = await mpRef.current?.submitDuelAnswer(duelId, qIdx, optIdx);
            if (updated) setActiveDuel(updated);
          }}
          onDuelVictory={handleDuelVictory}
          onClose={() => {
            setShowVersusModal(false);
            setActiveDuel(null);
          }}
        />
      )}

      {showTeacherAdmin && session.role === 'teacher' && (
        <TeacherAdminModal
          onlinePlayers={onlinePlayers}
          broadcast={broadcast}
          spectator={spectator}
          onSetSpectator={(next) => setSpectator(next)}
          onClose={() => setShowTeacherAdmin(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <EduCityApp />
    </AppErrorBoundary>
  );
}
