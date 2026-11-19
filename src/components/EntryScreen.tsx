import { useEffect, useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  Lock,
  Play,
  ShieldCheck,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { audioGuide, WELCOME_VOICE_TEXT } from '../services/audioGuide';
import { googleSignInBasic } from '../services/firebase';
import { getOrCreateTabSessionId } from '../services/multiplayerClient';
import type { AvatarCustomization, CompanionType, PlayerSession } from '../types/game';

interface EntryScreenProps {
  onEnterCity: (session: PlayerSession) => void;
}

const SHIRT_COLORS = ['#2563EB', '#DC2626', '#059669', '#D97706', '#7C3AED', '#0F172A'];

const COMPANIONS: Array<{ id: CompanionType; label: string; desc: string }> = [
  { id: 'owl', label: 'Burung Hantu', desc: 'Penjaga Literasi' },
  { id: 'robot', label: 'EduBot Mini', desc: 'Asisten Grammar' },
  { id: 'fox', label: 'Rubah Cerdik', desc: 'Pemburu Vocab' },
  { id: 'crystal', label: 'Kristal Bahasa', desc: 'Energi Fokus' },
];

export function EntryScreen({ onEnterCity }: EntryScreenProps) {
  const [name, setName] = useState('');
  const [school, setSchool] = useState('SMP Bhayangkari');
  const [className, setClassName] = useState('VIII-A');
  const [shirtColor, setShirtColor] = useState('#2563EB');
  const [companion, setCompanion] = useState<CompanionType>('owl');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Teacher Admin Password Modal
  const [showTeacherPrompt, setShowTeacherPrompt] = useState(false);
  const [teacherPass, setTeacherPass] = useState('');
  const [teacherBusy, setTeacherBusy] = useState(false);
  const [teacherError, setTeacherError] = useState('');

  // Automatic welcome voice & background music on page open (and first pointer interaction if blocked by autoplay policy)
  useEffect(() => {
    audioGuide.unlockAndStartMusic();
    audioGuide.speak(WELCOME_VOICE_TEXT, 'id-ID');

    const unlockOnce = () => {
      if (audioGuide.isMusicEnabled()) {
        audioGuide.unlockAndStartMusic();
      }
      window.removeEventListener('pointerdown', unlockOnce);
    };
    window.addEventListener('pointerdown', unlockOnce);
    return () => window.removeEventListener('pointerdown', unlockOnce);
  }, []);

  const toggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    audioGuide.setMusicEnabled(next);
    audioGuide.setVoiceEnabled(next);
    if (next) {
      audioGuide.unlockAndStartMusic();
      audioGuide.speak(WELCOME_VOICE_TEXT, 'id-ID');
    }
  };

  const buildAvatar = (): AvatarCustomization => ({
    shirtColor,
    pantsColor: '#1E293B',
    hairColor: '#1E1B18',
    hatColor: '#F59E0B',
    companion,
  });

  const handleDirectEnter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Mohon isi Nama Lengkap Siswa terlebih dahulu.');
      return;
    }
    setErrorMsg('');
    audioGuide.unlockAndStartMusic();
    onEnterCity({
      sessionId: getOrCreateTabSessionId(),
      isGoogleAuth: false,
      name: name.trim(),
      school: school.trim() || 'SMP Nusantara',
      className: className.trim() || 'VIII',
      role: 'student',
      avatar: buildAvatar(),
    });
  };

  const handleGoogleEnter = async () => {
    setErrorMsg('');
    setGoogleBusy(true);
    audioGuide.unlockAndStartMusic();
    try {
      const user = await googleSignInBasic();
      const resolvedName = name.trim() || user.displayName || 'Siswa Google';
      onEnterCity({
        sessionId: getOrCreateTabSessionId(),
        uid: user.uid,
        email: user.email || undefined,
        isGoogleAuth: true,
        name: resolvedName,
        school: school.trim() || 'SMP Nusantara',
        className: className.trim() || 'VIII',
        role: 'student',
        avatar: buildAvatar(),
      });
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? `Login Google dibatalkan atau gagal: ${err.message}`
          : 'Login Google gagal.'
      );
    } finally {
      setGoogleBusy(false);
    }
  };

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherError('');
    setTeacherBusy(true);
    try {
      const res = await fetch('/api/teacher/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: teacherPass }),
      });
      if (!res.ok) {
        setTeacherError('Sandi Admin Guru salah. Periksa kembali sandi Anda.');
        setTeacherBusy(false);
        return;
      }
      sessionStorage.setItem('educity_teacher_pwd', teacherPass);
      audioGuide.unlockAndStartMusic();
      onEnterCity({
        sessionId: getOrCreateTabSessionId(),
        isGoogleAuth: false,
        name: name.trim() || 'Admin Guru',
        school: school.trim() || 'SMP Bhayangkari',
        className: 'Guru Pengajar',
        role: 'teacher',
        avatar: {
          ...buildAvatar(),
          shirtColor: '#991B1B',
          hatColor: '#FBBF24',
        },
      });
    } catch {
      setTeacherError('Gagal memverifikasi sandi ke server.');
    } finally {
      setTeacherBusy(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-y-auto bg-slate-950 text-slate-50 flex flex-col justify-between">
      {/* Procedural Architectural School Campus Backdrop + Thin Dark Scrim */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <svg
          viewBox="0 0 1440 810"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full object-cover"
        >
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f3460" />
              <stop offset="55%" stopColor="#1e6091" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.65" />
            </linearGradient>
            <linearGradient id="courtGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          <rect width="1440" height="810" fill="url(#skyGrad)" />
          {/* Distant Hills */}
          <path d="M0 540 Q320 430 720 510 T1440 480 L1440 810 L0 810 Z" fill="#1e3a2f" />
          {/* School Main Building Silhouette */}
          <rect x="240" y="310" width="960" height="230" rx="4" fill="#e2e8f0" />
          <polygon points="210,315 720,205 1230,315" fill="#991b1b" />
          <rect x="640" y="255" width="160" height="285" fill="#cbd5e1" />
          <polygon points="615,260 720,185 825,260" fill="#b91c1c" />
          {/* School Windows */}
          {[290, 380, 470, 560, 840, 930, 1020, 1110].map((wx) => (
            <g key={wx}>
              <rect x={wx} y="345" width="52" height="62" rx="3" fill="#0284c7" opacity="0.85" />
              <rect x={wx} y="432" width="52" height="62" rx="3" fill="#0284c7" opacity="0.85" />
            </g>
          ))}
          {/* Main Entrance Arch */}
          <rect x="685" y="425" width="70" height="115" rx="35" fill="#1e293b" />
          {/* Flagpole & Red-White Flag */}
          <rect x="717" y="130" width="6" height="410" fill="#f8fafc" />
          <rect x="723" y="135" width="76" height="24" fill="#dc2626" />
          <rect x="723" y="159" width="76" height="24" fill="#ffffff" />
          {/* Courtyard */}
          <rect x="0" y="540" width="1440" height="270" fill="url(#courtGrad)" />
          {/* Shade Trees */}
          <circle cx="150" cy="440" r="85" fill="#15803d" />
          <rect x="138" y="490" width="24" height="80" fill="#78350f" />
          <circle cx="1290" cy="435" r="92" fill="#166534" />
          <rect x="1278" y="490" width="24" height="80" fill="#78350f" />
        </svg>
        {/* Thin Dark Layer for Clear Form Readability */}
        <div className="absolute inset-0 bg-slate-950/60" />
      </div>

      {/* Top Corner Transparent Logos (NO background boxes, hidden once inside 3D city) */}
      <header className="relative z-10 flex items-start justify-between px-4 sm:px-8 pt-4 sm:pt-6 gap-4">
        {/* Top-Left: Transparent Foundation / Ministry Emblem */}
        <div className="flex items-center gap-3 select-none">
          <svg
            viewBox="0 0 64 64"
            className="w-11 h-11 sm:w-14 sm:h-14 drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)]"
            aria-label="Logo Yayasan Pendidikan"
          >
            <polygon points="32,4 58,18 58,46 32,60 6,46 6,18" fill="none" stroke="#fbbf24" strokeWidth="3.5" />
            <path d="M20 40 L32 16 L44 40 Z" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" />
            <circle cx="32" cy="34" r="5" fill="#fbbf24" />
          </svg>
          <div className="leading-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
            <div className="text-xs font-semibold text-amber-300 tracking-wide">Yayasan Pendidikan</div>
            <div className="text-sm sm:text-base font-bold text-white font-display">Nusantara EduWorld</div>
          </div>
        </div>

        {/* Top-Right: Transparent School Crest */}
        <div className="flex items-center gap-3 text-right select-none">
          <div className="leading-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
            <div className="text-xs font-semibold text-sky-300 tracking-wide">Bahasa Inggris SMP</div>
            <div className="text-sm sm:text-base font-bold text-white font-display">SMP EduCity 3D</div>
          </div>
          <svg
            viewBox="0 0 64 64"
            className="w-11 h-11 sm:w-14 sm:h-14 drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)]"
            aria-label="Logo Sekolah"
          >
            <path
              d="M12 14 H52 V34 C52 46 32 58 32 58 C32 58 12 46 12 34 Z"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3.5"
            />
            <path d="M22 28 H42 M22 36 H42 M32 20 V44" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />
          </svg>
        </div>
      </header>

      {/* Main Entry Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Welcome & Voice Info */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-white/15 rounded-2xl p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-xs font-semibold text-amber-300">
                  Petualangan Dunia Terbuka 3D
                </span>
                <button
                  type="button"
                  onClick={toggleAudio}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-100 transition-colors cursor-pointer"
                >
                  {audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
                  <span>{audioEnabled ? 'Suara Aktif' : 'Suara Mati'}</span>
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-3">
                EduCity 3D: Bahasa Inggris SMP
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed mb-5">
                {WELCOME_VOICE_TEXT}
              </p>

              <div className="space-y-3 text-sm text-slate-200 border-t border-white/10 pt-4">
                <div className="flex items-start gap-2.5">
                  <BookOpen className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>5 Gedung Bab Materi berisi 50 soal lengkap + 5 objek 3D permanen per gedung.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <GraduationCap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Arena Duel 1v1 (PvP Real-Time & Bot) dengan 115 soal acak Bahasa Inggris.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>1 Kota Bersama lintas perangkat + cuaca lokal real-time + rekap Google Sheet.</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowTeacherPrompt(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 text-sm font-semibold transition-colors cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Mode Admin Guru</span>
              </button>
            </div>
          </div>

          {/* Right Student Login & Avatar Form */}
          <form
            onSubmit={handleDirectEnter}
            className="lg:col-span-7 bg-slate-900/92 border border-white/15 rounded-2xl p-6 shadow-2xl flex flex-col justify-between"
          >
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Profil Siswa & Avatar 3D</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Lengkap Siswa
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Ardea Pratama"
                    maxLength={80}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Asal Sekolah
                  </label>
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="Contoh: SMP Negeri 1"
                    maxLength={100}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kelas
                  </label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="Contoh: VIII-A"
                    maxLength={40}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Shirt Color Swatches */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Pilih Warna Baju Avatar
                </label>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {SHIRT_COLORS.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setShirtColor(hex)}
                      aria-label={`Pilih warna baju ${hex}`}
                      className={`w-9 h-9 rounded-lg border-2 transition-transform cursor-pointer ${
                        shirtColor === hex ? 'border-white scale-110 ring-2 ring-sky-400' : 'border-slate-700'
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>

              {/* 3D Companion Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Pilih Pendamping 3D di Bahu
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {COMPANIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCompanion(c.id)}
                      className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                        companion === c.id
                          ? 'bg-sky-600/25 border-sky-400 text-white'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-xs font-bold">{c.label}</div>
                      <div className="text-[11px] text-slate-400">{c.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-300 bg-rose-950/70 border border-rose-500/40 rounded-lg px-3 py-2">
                  {errorMsg}
                </p>
              )}
            </div>

            <div className="mt-5 space-y-2.5">
              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Masuk Langsung ke Kota 3D</span>
              </button>

              <button
                type="button"
                onClick={handleGoogleEnter}
                disabled={googleBusy}
                className="gsi-material-button"
              >
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg viewBox="0 0 48 48" className="block w-full h-full">
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">
                    {googleBusy ? 'Menghubungkan Akun Google...' : 'Masuk dengan Google'}
                  </span>
                </div>
              </button>
              <p className="text-[11px] text-slate-400 text-center">
                Login Google hanya memakai profil dasar. Izin Google Sheet diminta terpisah saat mengirim tugas.
              </p>
            </div>
          </form>
        </div>
      </main>

      {/* Teacher Admin Password Modal */}
      {showTeacherPrompt && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleTeacherSubmit}
            className="w-full max-w-md bg-slate-900 border border-amber-400/40 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-amber-300">Verifikasi Mode Admin Guru</h3>
              <button
                type="button"
                onClick={() => setShowTeacherPrompt(false)}
                className="text-sm text-slate-400 hover:text-white cursor-pointer"
              >
                Tutup
              </button>
            </div>
            <p className="text-xs text-slate-300">
              Masukkan sandi guru untuk mengakses rekap kelas, bekukan layar diskusi, pengumuman suara, dan Mode Spectator.
            </p>
            <input
              type="password"
              value={teacherPass}
              onChange={(e) => setTeacherPass(e.target.value)}
              placeholder="Masukkan sandi Admin Guru..."
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {teacherError && (
              <p className="text-xs text-rose-300 bg-rose-950/70 border border-rose-500/40 rounded-lg px-3 py-2">
                {teacherError}
              </p>
            )}
            <button
              type="submit"
              disabled={teacherBusy}
              className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm cursor-pointer disabled:opacity-60"
            >
              {teacherBusy ? 'Memverifikasi...' : 'Masuk Mode Admin Guru'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
