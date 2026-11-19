import { useEffect, useState } from 'react';
import { Bot, Swords, Trophy, Users, X } from 'lucide-react';
import { VERSUS_BANK } from '../data/versusBank';
import { audioGuide } from '../services/audioGuide';
import type { ActiveDuel, OnlinePlayer, PlayerSession, VersusQuestion } from '../types/game';

interface VersusArenaModalProps {
  session: PlayerSession;
  onlinePlayers: OnlinePlayer[];
  activeDuel: ActiveDuel | null;
  onChallengePlayer: (targetSessionId: string) => void;
  onSubmitPvpAnswer: (duelId: string, questionIndex: number, optionIndex: number) => void;
  onDuelVictory: (won: boolean) => void;
  onClose: () => void;
}

function pickRandomQuestions(count = 8): VersusQuestion[] {
  const arr = [...VERSUS_BANK];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

export function VersusArenaModal({
  session,
  onlinePlayers,
  activeDuel,
  onChallengePlayer,
  onSubmitPvpAnswer,
  onDuelVictory,
  onClose,
}: VersusArenaModalProps) {
  const [botDuelQuestions, setBotDuelQuestions] = useState<VersusQuestion[] | null>(null);
  const [botQIdx, setBotQIdx] = useState(0);
  const [myBotScore, setMyBotScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [botAnsweredCount, setBotAnsweredCount] = useState(0);
  const [botFeedback, setBotFeedback] = useState<string | null>(null);
  const [botFinished, setBotFinished] = useState(false);
  const [sentChallengeName, setSentChallengeName] = useState<string | null>(null);

  const [pvpQIdx, setPvpQIdx] = useState(0);
  const [pvpReportedFinish, setPvpReportedFinish] = useState(false);

  // Bot automated pace during 1v1 vs Bot
  useEffect(() => {
    if (!botDuelQuestions || botFinished) return;
    const timer = window.setInterval(() => {
      setBotAnsweredCount((prev) => {
        if (prev >= botDuelQuestions.length) return prev;
        const botCorrect = Math.random() < 0.72;
        if (botCorrect) {
          setBotScore((s) => s + 15);
        }
        return prev + 1;
      });
    }, 3400);
    return () => window.clearInterval(timer);
  }, [botDuelQuestions, botFinished]);

  // Track PvP finish
  useEffect(() => {
    if (activeDuel && activeDuel.status === 'finished' && !pvpReportedFinish) {
      setPvpReportedFinish(true);
      const won = activeDuel.winnerSessionId === session.sessionId;
      onDuelVictory(won);
    }
  }, [activeDuel, pvpReportedFinish, session.sessionId, onDuelVictory]);

  const startBotMatch = () => {
    setBotDuelQuestions(pickRandomQuestions(8));
    setBotQIdx(0);
    setMyBotScore(0);
    setBotScore(0);
    setBotAnsweredCount(0);
    setBotFeedback(null);
    setBotFinished(false);
  };

  const handleBotAnswer = (optIndex: number) => {
    if (!botDuelQuestions || botFinished || botFeedback) return;
    const q = botDuelQuestions[botQIdx];
    const isCorrect = q.correctIndex === optIndex;
    const nextMyScore = isCorrect ? myBotScore + 15 : myBotScore;
    if (isCorrect) {
      audioGuide.playCorrectSfx();
      setMyBotScore(nextMyScore);
      setBotFeedback(`Benar! +15 Poin — ${q.explanation}`);
    } else {
      audioGuide.playWrongSfx();
      setBotFeedback(`Kurang tepat. Jawaban: ${q.options[q.correctIndex]} — ${q.explanation}`);
    }

    window.setTimeout(() => {
      setBotFeedback(null);
      if (botQIdx + 1 >= botDuelQuestions.length) {
        setBotFinished(true);
        onDuelVictory(nextMyScore >= botScore);
      } else {
        setBotQIdx((i) => i + 1);
      }
    }, 1150);
  };

  const otherPlayers = onlinePlayers.filter((p) => p.sessionId !== session.sessionId);

  // Render active Real-Time PvP Duel
  if (activeDuel) {
    const amChallenger = activeDuel.challenger.sessionId === session.sessionId;
    const me = amChallenger ? activeDuel.challenger : activeDuel.opponent;
    const foe = amChallenger ? activeDuel.opponent : activeDuel.challenger;
    const q = activeDuel.questions[pvpQIdx];
    const doneAnswering = me.answeredCount >= activeDuel.questions.length;

    return (
      <div className="fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-slate-900 border-2 border-amber-400 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <Swords className="w-5 h-5 text-red-400" />
              <span>DUEL 1v1 REAL-TIME PvP</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 inline-flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scoreboard */}
          <div className="grid grid-cols-2 gap-3 bg-slate-950 rounded-xl p-3.5 border border-slate-800">
            <div>
              <div className="text-xs text-sky-400 font-bold">{me.name} (Anda)</div>
              <div className="text-2xl font-extrabold text-white font-mono-num">{me.score}</div>
              <div className="text-[11px] text-slate-400 font-mono-num">
                Soal {me.answeredCount}/{activeDuel.questions.length}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-rose-400 font-bold">{foe.name}</div>
              <div className="text-2xl font-extrabold text-white font-mono-num">{foe.score}</div>
              <div className="text-[11px] text-slate-400 font-mono-num">
                Soal {foe.answeredCount}/{activeDuel.questions.length}
              </div>
            </div>
          </div>

          {activeDuel.status === 'finished' ? (
            <div className="rounded-xl bg-slate-800/80 border border-amber-400/50 p-6 text-center space-y-3">
              <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
              <h3 className="text-2xl font-extrabold text-white">
                {activeDuel.winnerSessionId === session.sessionId
                  ? 'Anda Menang Duel!'
                  : activeDuel.winnerSessionId === 'draw'
                    ? 'Hasil Seri!'
                    : `${foe.name} Menang!`}
              </h3>
              <p className="text-sm text-slate-300">
                Skor Akhir: <strong className="font-mono-num">{me.score}</strong> vs{' '}
                <strong className="font-mono-num">{foe.score}</strong>
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm cursor-pointer"
              >
                Kembali ke Kota 3D
              </button>
            </div>
          ) : doneAnswering ? (
            <div className="rounded-xl bg-slate-800 p-6 text-center text-sm text-slate-300">
              Anda sudah menyelesaikan semua soal! Menunggu {foe.name} menyelesaikan soal tersisa...
            </div>
          ) : (
            q && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Kategori: {q.category}</span>
                  <span className="font-mono-num">
                    Soal {pvpQIdx + 1}/{activeDuel.questions.length}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-800 text-base font-semibold text-white whitespace-pre-line">
                  {q.prompt}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (idx === q.correctIndex) audioGuide.playCorrectSfx();
                        else audioGuide.playWrongSfx();
                        onSubmitPvpAnswer(activeDuel.duelId, pvpQIdx, idx);
                        if (pvpQIdx + 1 < activeDuel.questions.length) {
                          setPvpQIdx((n) => n + 1);
                        }
                      }}
                      className="p-3.5 rounded-xl bg-slate-950 hover:bg-red-950/60 border border-slate-700 hover:border-amber-400 text-left text-sm font-medium text-white cursor-pointer"
                    >
                      <span className="font-bold text-amber-300 mr-2">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90dvh] overflow-y-auto bg-slate-900 border-2 border-red-500/70 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-amber-300">ARENA MERAH-EMAS · {VERSUS_BANK.length} SOAL ACAK</div>
            <h2 className="text-xl font-extrabold text-white">Arena Duel Bahasa Inggris 1v1</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 inline-flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!botDuelQuestions ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="rounded-xl bg-gradient-to-br from-red-950/80 to-slate-900 border border-amber-400/50 p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <Bot className="w-5 h-5" />
                  <span>Duel Cepat vs EduBot</span>
                </div>
                <p className="text-xs text-slate-300">
                  Beradu cepat menjawab 8 soal acak Bahasa Inggris melawan EduBot otomatis. Soal 100% berbeda dari 50 soal gedung bab!
                </p>
                <button
                  type="button"
                  onClick={startBotMatch}
                  className="w-full h-10 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Mulai Duel vs EduBot
                </button>
              </div>

              <div className="rounded-xl bg-slate-800/70 border border-slate-700 p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-sky-300 font-bold">
                  <Users className="w-5 h-5" />
                  <span>Tantang Pemain Online (PvP)</span>
                </div>
                {otherPlayers.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    Belum ada pemain lain yang online saat ini. Buka tab lain atau ajak teman untuk duel real-time!
                  </p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {otherPlayers.map((p) => (
                      <div
                        key={p.sessionId}
                        className="flex items-center justify-between gap-2 bg-slate-900 p-2 rounded-lg border border-slate-700"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{p.name}</div>
                          <div className="text-[11px] text-slate-400 truncate">{p.className}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onChallengePlayer(p.sessionId);
                            setSentChallengeName(p.name);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer shrink-0"
                        >
                          Tantang
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {sentChallengeName && (
                  <p className="text-[11px] text-emerald-300">
                    Tantangan dikirim ke {sentChallengeName}. Menunggu lawan menerima...
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : botFinished ? (
          <div className="rounded-xl bg-slate-800/80 border border-amber-400/50 p-6 text-center space-y-3">
            <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="text-2xl font-extrabold text-white">
              {myBotScore > botScore
                ? 'Kemenangan Luar Biasa!'
                : myBotScore === botScore
                  ? 'Pertandingan Seri!'
                  : 'EduBot Menang Kali Ini!'}
            </h3>
            <p className="text-sm text-slate-300">
              Skor Anda: <strong className="text-sky-300 font-mono-num">{myBotScore}</strong> vs EduBot:{' '}
              <strong className="text-rose-300 font-mono-num">{botScore}</strong>
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={startBotMatch}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Main Lagi (Soal Acak Baru)
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs cursor-pointer"
              >
                Keluar Arena
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 bg-slate-950 rounded-xl p-3.5 border border-slate-800">
              <div>
                <div className="text-xs font-bold text-sky-400">{session.name}</div>
                <div className="text-2xl font-extrabold text-white font-mono-num">{myBotScore}</div>
                <div className="text-[11px] text-slate-400 font-mono-num">
                  Soal {botQIdx + 1}/{botDuelQuestions.length}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-rose-400">EduBot SMP</div>
                <div className="text-2xl font-extrabold text-white font-mono-num">{botScore}</div>
                <div className="text-[11px] text-slate-400 font-mono-num">
                  Terjawab {botAnsweredCount}/{botDuelQuestions.length}
                </div>
              </div>
            </div>

            {botDuelQuestions[botQIdx] && (
              <div className="space-y-3">
                <div className="text-xs text-amber-300 font-semibold">
                  Kategori: {botDuelQuestions[botQIdx].category}
                </div>
                <div className="p-4 rounded-xl bg-slate-800 text-base font-semibold text-white whitespace-pre-line">
                  {botDuelQuestions[botQIdx].prompt}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {botDuelQuestions[botQIdx].options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={Boolean(botFeedback)}
                      onClick={() => handleBotAnswer(idx)}
                      className="p-3.5 rounded-xl bg-slate-950 hover:bg-red-950/60 border border-slate-700 hover:border-amber-400 text-left text-sm font-medium text-white cursor-pointer disabled:opacity-70"
                    >
                      <span className="font-bold text-amber-300 mr-2">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      {opt}
                    </button>
                  ))}
                </div>
                {botFeedback && (
                  <div className="p-3 rounded-xl bg-slate-800 border border-amber-400/50 text-xs text-amber-200">
                    {botFeedback}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
