import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  HelpCircle,
  PlayCircle,
  Send,
  Sparkles,
  Volume2,
  X,
  XCircle,
} from 'lucide-react';
import { audioGuide } from '../services/audioGuide';
import {
  getSavedTeacherSheetId,
  submitProgressToGoogleSheet,
} from '../services/googleSheets';
import type { ChapterDefinition, ChapterQuestion, PlayerProgress, PlayerSession } from '../types/game';

interface BuildingStationModalProps {
  chapter: ChapterDefinition;
  initialStation: 'video' | 'quiz' | 'sheet';
  session: PlayerSession;
  progress: PlayerProgress;
  onAnswerCorrect: (questionId: string, chapterId: string) => void;
  onSaveReflection: (chapterId: string, reflection: string) => void;
  onKickFromBuilding?: (chapterId: string, questionNumber: number) => void;
  onClose: () => void;
}

export function BuildingStationModal({
  chapter,
  initialStation,
  session,
  progress,
  onAnswerCorrect,
  onSaveReflection,
  onKickFromBuilding,
  onClose,
}: BuildingStationModalProps) {
  const [tab, setTab] = useState<'video' | 'quiz' | 'sheet'>(initialStation);
  const [slideIdx, setSlideIdx] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'a' | 'b' | 'c' | 'd'>>({});
  const [reflectionDraft, setReflectionDraft] = useState(progress.reflections[chapter.id] || '');
  const [reflectionSavedNotice, setReflectionSavedNotice] = useState(false);
  const [isKicking, setIsKicking] = useState(false);
  const kickTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (kickTimerRef.current !== null) {
        window.clearTimeout(kickTimerRef.current);
      }
    };
  }, []);

  // Google Sheet submission states (with explicit confirmation before mutation)
  const [sheetIdInput, setSheetIdInput] = useState(getSavedTeacherSheetId());
  const [confirmSheetModal, setConfirmSheetModal] = useState(false);
  const [sheetBusy, setSheetBusy] = useState(false);
  const [sheetResult, setSheetResult] = useState<{ url: string; msg: string } | null>(null);
  const [sheetError, setSheetError] = useState('');

  const correctInChapter = chapter.questions.filter((q) =>
    progress.answeredCorrectIds.includes(q.id)
  ).length;
  const unlockedObjects = Math.min(5, Math.floor(correctInChapter / 2));

  const currentSlide = chapter.videoSlides[slideIdx] || chapter.videoSlides[0];
  const currentQ: ChapterQuestion = chapter.questions[qIndex] || chapter.questions[0];
  const chosenForQ = selectedAnswers[currentQ.id];
  const alreadyMasteredQ = progress.answeredCorrectIds.includes(currentQ.id);
  const isStudent = session.role !== 'teacher';

  const handleChooseOption = (key: 'a' | 'b' | 'c' | 'd') => {
    if (chosenForQ || alreadyMasteredQ || isKicking) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: key }));
    if (key === currentQ.correctKey) {
      audioGuide.playCorrectSfx();
      onAnswerCorrect(currentQ.id, chapter.id);
    } else {
      audioGuide.playWrongSfx();
      if (isStudent && onKickFromBuilding) {
        setIsKicking(true);
        audioGuide.speak('Jawaban salah! Kamu dikeluarkan dari gedung.', 'id-ID');
        kickTimerRef.current = window.setTimeout(() => {
          kickTimerRef.current = null;
          onKickFromBuilding(chapter.id, currentQ.number);
        }, 1400);
      }
    }
  };

  const handleCloseSafely = () => {
    if (isKicking && onKickFromBuilding) {
      if (kickTimerRef.current !== null) {
        window.clearTimeout(kickTimerRef.current);
        kickTimerRef.current = null;
      }
      onKickFromBuilding(chapter.id, currentQ.number);
      return;
    }
    onClose();
  };

  const handleRetryWrong = () => {
    if (isStudent || isKicking) return;
    setSelectedAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
  };

  const handleSaveReflectionClick = () => {
    onSaveReflection(chapter.id, reflectionDraft);
    setReflectionSavedNotice(true);
    window.setTimeout(() => setReflectionSavedNotice(false), 2500);
  };

  const handleConfirmSendSheet = async () => {
    setConfirmSheetModal(false);
    setSheetBusy(true);
    setSheetError('');
    setSheetResult(null);
    try {
      const res = await submitProgressToGoogleSheet({
        studentName: session.name,
        school: session.school,
        className: session.className,
        chapterTitle: chapter.title,
        correctInChapter,
        totalInChapter: chapter.questions.length,
        totalScore: progress.totalScore,
        level: progress.level,
        reflection: reflectionDraft,
        spreadsheetId: sheetIdInput.trim() || undefined,
      });
      setSheetIdInput(res.spreadsheetId);
      setSheetResult({
        url: res.spreadsheetUrl,
        msg: 'Data skor & refleksi berhasil dikirim ke Google Sheet Guru!',
      });
    } catch (err) {
      setSheetError(err instanceof Error ? err.message : 'Gagal mengirim ke Google Sheet.');
    } finally {
      setSheetBusy(false);
    }
  };

  const renderPromptWithUnderline = (q: ChapterQuestion) => {
    if (!q.underlinedWord || !q.prompt.includes(q.underlinedWord)) {
      return <span className="whitespace-pre-line">{q.prompt}</span>;
    }
    const parts = q.prompt.split(q.underlinedWord);
    return (
      <span className="whitespace-pre-line">
        {parts[0]}
        <u className="decoration-amber-400 decoration-2 underline-offset-4 font-bold text-amber-200">
          {q.underlinedWord}
        </u>
        {parts.slice(1).join(q.underlinedWord)}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-4xl max-h-[92dvh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div
          className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-4"
          style={{ borderTopWidth: 4, borderTopColor: chapter.accentHex }}
        >
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-400">
              {chapter.buildingName} · {correctInChapter}/{chapter.questions.length} Soal Benar · {unlockedObjects}/5 Objek 3D
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white truncate">{chapter.title}</h2>
          </div>
          <button
            type="button"
            onClick={handleCloseSafely}
            aria-label="Tutup Stasiun"
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 inline-flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Station Navigation Tabs */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            disabled={isKicking}
            onClick={() => setTab('video')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-50 ${
              tab === 'video' ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            <span>1. Layar Video Pembahasan</span>
          </button>
          <button
            type="button"
            disabled={isKicking}
            onClick={() => setTab('quiz')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-50 ${
              tab === 'quiz' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>2. Meja Soal & Refleksi ({chapter.questions.length} Soal)</span>
          </button>
          <button
            type="button"
            disabled={isKicking}
            onClick={() => setTab('sheet')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-50 ${
              tab === 'sheet' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>3. Terminal Kirim Google Sheet</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {tab === 'video' && (
            <div className="space-y-5">
              {/* Simulated Interactive Explainer Screen */}
              <div className="rounded-2xl bg-slate-950 border border-slate-700 p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-sky-400">
                    Slide {slideIdx + 1} dari {chapter.videoSlides.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => audioGuide.speak(currentSlide.voiceScript, 'id-ID')}
                    className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-300 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Putar Narasi Suara</span>
                  </button>
                </div>

                <h3 className="text-xl font-bold text-white">{currentSlide.title}</h3>
                <div className="p-4 rounded-xl bg-slate-900 border border-sky-500/30 text-amber-200 font-semibold text-base">
                  {currentSlide.englishExample}
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">{currentSlide.indonesianSummary}</p>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    disabled={slideIdx === 0}
                    onClick={() => setSlideIdx((i) => Math.max(0, i - 1))}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-white cursor-pointer"
                  >
                    Slide Sebelumnya
                  </button>
                  <button
                    type="button"
                    disabled={slideIdx >= chapter.videoSlides.length - 1}
                    onClick={() => setSlideIdx((i) => Math.min(chapter.videoSlides.length - 1, i + 1))}
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-xs font-bold text-slate-950 cursor-pointer"
                  >
                    Slide Berikutnya
                  </button>
                </div>
              </div>

              {/* Chapter Core Summary Points */}
              <div className="rounded-2xl bg-slate-800/60 border border-slate-700 p-5 space-y-2.5">
                <h4 className="text-sm font-bold text-white">Ringkasan Materi Inti</h4>
                <ul className="space-y-2 text-sm text-slate-300 list-disc pl-5">
                  {chapter.summaryPoints.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {tab === 'quiz' && (
            <div className="space-y-5">
              {/* 3D Object Reward Strip */}
              <div className="rounded-xl bg-slate-800/80 border border-slate-700 p-3.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>
                    Setiap 2 soal benar memunculkan 1 objek 3D permanen di ruangan ini (
                    <strong className="text-amber-300 font-mono-num">{unlockedObjects}/5</strong> terbuka).
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {chapter.rewardObjectNames.map((objName, idx) => (
                    <span
                      key={objName}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold ${
                        idx < unlockedObjects
                          ? 'bg-amber-500/25 border border-amber-400/50 text-amber-200'
                          : 'bg-slate-900 border border-slate-700 text-slate-500'
                      }`}
                    >
                      {objName}
                    </span>
                  ))}
                </div>
              </div>

              {/* Question Number Stepper */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {chapter.questions.map((q, idx) => {
                  const isCorrectDone = progress.answeredCorrectIds.includes(q.id);
                  return (
                    <button
                      key={q.id}
                      type="button"
                      disabled={isKicking}
                      onClick={() => setQIndex(idx)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono-num border cursor-pointer disabled:opacity-50 ${
                        idx === qIndex
                          ? 'bg-sky-500 text-slate-950 border-white'
                          : isCorrectDone
                            ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      No.{q.number}
                    </button>
                  );
                })}
              </div>

              {/* Reading Passage if applicable */}
              {currentQ.passage && (
                <div className="rounded-xl bg-slate-950 border border-slate-700 p-4 space-y-1.5">
                  {currentQ.passageTitle && (
                    <div className="text-xs font-bold text-sky-400">{currentQ.passageTitle}</div>
                  )}
                  <p className="text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                    {currentQ.passage}
                  </p>
                </div>
              )}

              {/* Question Prompt & Options */}
              <div className="rounded-xl bg-slate-800/70 border border-slate-700 p-5 space-y-4">
                <div className="text-base font-semibold text-white leading-relaxed">
                  {renderPromptWithUnderline(currentQ)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentQ.options.map((opt) => {
                    const isPicked = chosenForQ === opt.key;
                    const isCorrectOption = opt.key === currentQ.correctKey;
                    const reveal = Boolean(chosenForQ) || alreadyMasteredQ;
                    const showCorrectHighlight =
                      alreadyMasteredQ || chosenForQ === currentQ.correctKey || !isStudent;
                    let cls =
                      'bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800 hover:border-sky-400';
                    if (reveal) {
                      if (isCorrectOption && showCorrectHighlight) {
                        cls = 'bg-emerald-900/60 border-emerald-400 text-emerald-100';
                      } else if (isPicked) {
                        cls = 'bg-rose-900/60 border-rose-400 text-rose-100';
                      } else {
                        cls = 'bg-slate-900/50 border-slate-800 text-slate-400';
                      }
                    }

                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleChooseOption(opt.key)}
                        className={`p-3.5 rounded-xl border text-left text-sm font-medium transition-colors flex items-start gap-2.5 cursor-pointer ${cls}`}
                      >
                        <span className="font-bold uppercase text-sky-300">{opt.key}.</span>
                        <span className="flex-1">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Instant Feedback & Explanation */}
                {(chosenForQ || alreadyMasteredQ) && (
                  <div
                    className={`rounded-xl p-4 border text-sm space-y-2 ${
                      alreadyMasteredQ || chosenForQ === currentQ.correctKey
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-100'
                        : 'bg-rose-950/80 border-rose-500 text-rose-100'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-bold">
                        {alreadyMasteredQ || chosenForQ === currentQ.correctKey ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Benar! Kunci Jawaban: {currentQ.correctKey.toUpperCase()}</span>
                          </>
                        ) : isStudent ? (
                          <>
                            <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0" />
                            <span>Jawaban Salah! Kamu dikeluarkan dari gedung...</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-400" />
                            <span>Kurang Tepat. Kunci Jawaban: {currentQ.correctKey.toUpperCase()}</span>
                          </>
                        )}
                      </div>
                      {!alreadyMasteredQ && chosenForQ !== currentQ.correctKey && (
                        isStudent ? (
                          <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-extrabold uppercase tracking-wide">
                            Kick ke Kota
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleRetryWrong}
                            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white cursor-pointer"
                          >
                            Coba Lagi
                          </button>
                        )
                      )}
                    </div>
                    {!alreadyMasteredQ && chosenForQ !== currentQ.correctKey && isStudent ? (
                      <p className="text-xs text-rose-200 leading-relaxed font-medium">
                        Aturan Gedung: siswa yang menjawab salah otomatis dikeluarkan dari gedung. Masuk kembali ke gedung untuk mencoba soal lagi!
                      </p>
                    ) : (
                      <p className="text-xs text-slate-200 leading-relaxed">{currentQ.explanation}</p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    disabled={qIndex === 0 || isKicking}
                    onClick={() => setQIndex((i) => Math.max(0, i - 1))}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-white cursor-pointer"
                  >
                    Soal Sebelumnya
                  </button>
                  <button
                    type="button"
                    disabled={qIndex >= chapter.questions.length - 1 || isKicking}
                    onClick={() => setQIndex((i) => Math.min(chapter.questions.length - 1, i + 1))}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-xs font-bold text-slate-950 cursor-pointer"
                  >
                    Soal Berikutnya
                  </button>
                </div>
              </div>

              {/* Student Reflection Box */}
              <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-4 space-y-2.5">
                <label className="block text-xs font-bold text-amber-300">
                  Refleksi Belajar Bab {chapter.number}
                </label>
                <p className="text-xs text-slate-300">{chapter.reflectionPrompt}</p>
                <textarea
                  rows={2}
                  value={reflectionDraft}
                  onChange={(e) => setReflectionDraft(e.target.value)}
                  placeholder="Tulis refleksi singkatmu di sini..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-400">
                    {reflectionSavedNotice ? 'Refleksi tersimpan ke progres!' : ''}
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveReflectionClick}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    Simpan Refleksi
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'sheet' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-800/75 border border-slate-700 p-5 space-y-4">
                <h3 className="text-lg font-bold text-white">Kirim Tugas & Nilai ke Google Sheet Guru</h3>
                <p className="text-sm text-slate-300">
                  Izin Google Drive & Google Sheets hanya diminta saat Anda menekan tombol kirim di terminal ini. Jika ID Spreadsheet dikosongkan, sistem akan otomatis membuat atau mencari spreadsheet bernama <strong>EduCity 3D — Rekap Bahasa Inggris SMP</strong>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-400">Siswa:</span>{' '}
                    <strong className="text-white">{session.name} ({session.className})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Sekolah:</span>{' '}
                    <strong className="text-white">{session.school}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Skor Bab {chapter.number}:</span>{' '}
                    <strong className="text-emerald-300 font-mono-num">
                      {correctInChapter}/{chapter.questions.length}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Total Skor & Level:</span>{' '}
                    <strong className="text-amber-300 font-mono-num">
                      {progress.totalScore} Poin · Lv.{progress.level}
                    </strong>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ID Spreadsheet Guru (Opsional — kosongkan untuk otomatis)
                  </label>
                  <input
                    type="text"
                    value={sheetIdInput}
                    onChange={(e) => setSheetIdInput(e.target.value)}
                    placeholder="Contoh: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                {sheetError && (
                  <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-xs text-rose-200">
                    {sheetError}
                  </div>
                )}

                {sheetResult && (
                  <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-xs text-emerald-100 space-y-1.5">
                    <div className="font-bold">{sheetResult.msg}</div>
                    <div>
                      Link Spreadsheet:{' '}
                      <a
                        href={sheetResult.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-sky-300 font-semibold"
                      >
                        Buka Google Sheet
                      </a>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  disabled={sheetBusy}
                  onClick={() => setConfirmSheetModal(true)}
                  className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-bold text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{sheetBusy ? 'Mengirim ke Google Sheets...' : 'Kirim Nilai ke Google Sheet Guru'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Explicit Confirmation Modal Before Mutating Google Sheet */}
      {confirmSheetModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/85 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-emerald-400/50 rounded-2xl p-6 shadow-2xl space-y-4">
            <h4 className="text-lg font-bold text-white">Konfirmasi Pengiriman Google Sheet</h4>
            <p className="text-sm text-slate-300">
              Sistem akan meminta izin Google Sheets dan menambahkan 1 baris rekap nilai untuk{' '}
              <strong>{session.name}</strong> pada <strong>{chapter.title}</strong> ({correctInChapter}/
              {chapter.questions.length} benar). Lanjutkan?
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmSheetModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSendSheet}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950 cursor-pointer"
              >
                Ya, Kirim Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
