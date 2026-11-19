import { useEffect, useState } from 'react';
import {
  Eye,
  FileSpreadsheet,
  Lock,
  Megaphone,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Users,
  X,
} from 'lucide-react';
import { fetchAllCloudProgressForAdmin } from '../services/firebase';
import {
  getSavedTeacherSheetId,
  readTeacherSheetRecap,
  type SheetRecapRow,
} from '../services/googleSheets';
import type { OnlinePlayer, TeacherBroadcast } from '../types/game';
import type { SpectatorState } from './GameCanvas3D';

interface TeacherAdminModalProps {
  onlinePlayers: OnlinePlayer[];
  broadcast: TeacherBroadcast;
  spectator: SpectatorState;
  onSetSpectator: (next: SpectatorState) => void;
  onClose: () => void;
}

interface ServerRecapRow {
  key: string;
  name: string;
  school: string;
  className: string;
  totalScore: number;
  answeredCount: number;
  completedChapters: number;
  pvpWins: number;
  level: number;
  updatedAt: string;
}

export function TeacherAdminModal({
  onlinePlayers,
  broadcast,
  spectator,
  onSetSpectator,
  onClose,
}: TeacherAdminModalProps) {
  const [tab, setTab] = useState<'recap' | 'controls' | 'sheet' | 'spectator'>('recap');
  const [serverRecap, setServerRecap] = useState<ServerRecapRow[]>([]);
  const [cloudRecapCount, setCloudRecapCount] = useState(0);
  const [freezeMsg, setFreezeMsg] = useState(
    broadcast.freezeMessage || 'Perhatian seluruh siswa! Layar dijeda untuk diskusi kelas.'
  );
  const [announcementText, setAnnouncementText] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [sheetId, setSheetId] = useState(getSavedTeacherSheetId());
  const [sheetRows, setSheetRows] = useState<SheetRecapRow[]>([]);
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetBusy, setSheetBusy] = useState(false);
  const [sheetError, setSheetError] = useState('');

  const teacherPassword = sessionStorage.getItem('educity_teacher_pwd') || '';

  const loadServerRecap = async () => {
    try {
      const res = await fetch(
        `/api/teacher/recap?password=${encodeURIComponent(teacherPassword)}`
      );
      if (res.ok) {
        const data = (await res.json()) as { records?: ServerRecapRow[] };
        setServerRecap(data.records || []);
      }
      const cloud = await fetchAllCloudProgressForAdmin();
      setCloudRecapCount(cloud.length);
    } catch {
      // ignore transient error
    }
  };

  useEffect(() => {
    loadServerRecap();
  }, []);

  const sendBroadcast = async (patch: {
    frozen?: boolean;
    freezeMessage?: string;
    announcement?: string;
  }) => {
    setActionMsg('');
    try {
      const res = await fetch('/api/teacher/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: teacherPassword,
          ...patch,
        }),
      });
      if (!res.ok) {
        setActionMsg('Sesi sandi guru tidak valid. Silakan masuk ulang melalui Mode Admin Guru.');
        return;
      }
      setActionMsg('Perintah berhasil disiarkan ke seluruh siswa secara langsung!');
    } catch {
      setActionMsg('Gagal menghubungi server.');
    }
  };

  const handleLoadTeacherSheet = async () => {
    setSheetBusy(true);
    setSheetError('');
    try {
      const res = await readTeacherSheetRecap(sheetId);
      setSheetId(res.spreadsheetId);
      setSheetUrl(res.spreadsheetUrl);
      setSheetRows(res.rows);
    } catch (err) {
      setSheetError(err instanceof Error ? err.message : 'Gagal membaca Google Sheet Guru.');
    } finally {
      setSheetBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-4xl max-h-[92dvh] bg-slate-900 border border-amber-400/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-xs font-semibold text-amber-300">Panel Khusus Pengajar</div>
              <h2 className="text-lg font-extrabold text-white">Mode Admin Guru — EduCity 3D</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 inline-flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setTab('recap')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              tab === 'recap' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Rekap Progres & Online ({onlinePlayers.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('controls')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              tab === 'controls' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Bekukan Layar & Pengumuman</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('sheet')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              tab === 'sheet' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Rekap Sheet Guru</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('spectator')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              tab === 'spectator' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Mode Spectator Guru</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {tab === 'recap' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-300">
                  Siswa Online: <strong className="text-emerald-300 font-mono-num">{onlinePlayers.length}</strong> · Tersimpan di Server:{' '}
                  <strong className="text-sky-300 font-mono-num">{serverRecap.length}</strong> · Cloud Firestore:{' '}
                  <strong className="text-amber-300 font-mono-num">{cloudRecapCount}</strong>
                </div>
                <button
                  type="button"
                  onClick={loadServerRecap}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Segarkan</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400">
                    <tr>
                      <th className="p-3">Nama</th>
                      <th className="p-3">Kelas / Sekolah</th>
                      <th className="p-3">Soal Benar</th>
                      <th className="p-3">Bab Selesai</th>
                      <th className="p-3">Total Poin</th>
                      <th className="p-3">Menang 1v1</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900">
                    {serverRecap.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-slate-400">
                          Belum ada rekaman progres siswa pada sesi server ini.
                        </td>
                      </tr>
                    ) : (
                      serverRecap.map((r) => (
                        <tr key={r.key}>
                          <td className="p-3 font-bold text-white">{r.name}</td>
                          <td className="p-3 text-slate-300">
                            {r.className} · {r.school}
                          </td>
                          <td className="p-3 font-mono-num text-emerald-300">{r.answeredCount}/50</td>
                          <td className="p-3 font-mono-num text-sky-300">{r.completedChapters}/5</td>
                          <td className="p-3 font-mono-num text-amber-300">{r.totalScore}</td>
                          <td className="p-3 font-mono-num text-white">{r.pvpWins}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'controls' && (
            <div className="space-y-5">
              {/* Freeze Screen Control */}
              <div className="rounded-xl bg-slate-800/70 border border-slate-700 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Bekukan Layar Seluruh Siswa</h3>
                  <span
                    className={`text-xs font-bold ${
                      broadcast.frozen ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {broadcast.frozen ? 'Status: Layar Siswa Dibekukan' : 'Status: Normal'}
                  </span>
                </div>
                <input
                  type="text"
                  value={freezeMsg}
                  onChange={(e) => setFreezeMsg(e.target.value)}
                  placeholder="Pesan diskusi kelas saat layar dibekukan..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                />
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => sendBroadcast({ frozen: true, freezeMessage: freezeMsg })}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <PauseCircle className="w-4 h-4" />
                    <span>Bekukan Layar Siswa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => sendBroadcast({ frozen: false })}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Aktifkan Kembali Layar</span>
                  </button>
                </div>
              </div>

              {/* Live Announcement + Voice */}
              <div className="rounded-xl bg-slate-800/70 border border-slate-700 p-4 space-y-3">
                <h3 className="text-sm font-bold text-white">Kirim Pengumuman Live (+ Suara Pemandu)</h3>
                <textarea
                  rows={2}
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="Contoh: Anak-anak, silakan berkumpul di Gedung Bab 2 sekarang!"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (announcementText.trim()) {
                      sendBroadcast({ announcement: announcementText.trim() });
                      setAnnouncementText('');
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Megaphone className="w-4 h-4" />
                  <span>Siarkan Pengumuman Sekarang</span>
                </button>
              </div>

              {actionMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-xs text-emerald-200">
                  {actionMsg}
                </div>
              )}
            </div>
          )}

          {tab === 'sheet' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={sheetId}
                  onChange={(e) => setSheetId(e.target.value)}
                  placeholder="ID Google Sheet (kosongkan untuk otomatis)"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                />
                <button
                  type="button"
                  disabled={sheetBusy}
                  onClick={handleLoadTeacherSheet}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer disabled:opacity-60"
                >
                  {sheetBusy ? 'Memuat Sheet...' : 'Buka Rekap Sheet Guru'}
                </button>
              </div>
              {sheetError && (
                <p className="text-xs text-rose-300 bg-rose-950/60 border border-rose-500/40 p-3 rounded-xl">
                  {sheetError}
                </p>
              )}
              {sheetUrl && (
                <div className="text-xs text-sky-300">
                  Spreadsheet aktif:{' '}
                  <a href={sheetUrl} target="_blank" rel="noreferrer" className="underline font-bold">
                    Buka di Google Sheets
                  </a>
                </div>
              )}
              {sheetRows.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-64">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400">
                      <tr>
                        <th className="p-2.5">Waktu</th>
                        <th className="p-2.5">Siswa</th>
                        <th className="p-2.5">Kelas</th>
                        <th className="p-2.5">Bab</th>
                        <th className="p-2.5">Skor Bab</th>
                        <th className="p-2.5">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900">
                      {sheetRows.map((row, i) => (
                        <tr key={i}>
                          <td className="p-2.5 text-slate-400">{row.timestamp}</td>
                          <td className="p-2.5 font-bold text-white">{row.studentName}</td>
                          <td className="p-2.5 text-slate-300">{row.className}</td>
                          <td className="p-2.5 text-slate-300">{row.chapterTitle}</td>
                          <td className="p-2.5 font-mono-num text-emerald-300">{row.chapterScore}</td>
                          <td className="p-2.5 font-mono-num text-amber-300">{row.totalScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'spectator' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Mode Spectator khusus Admin Guru memungkinkan Anda terbang bebas memantau seluruh kota 3D atau mengikuti kamera siswa secara langsung. Fitur ini tidak tersedia untuk siswa biasa.
              </p>

              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onSetSpectator({ mode: 'free', targetSessionId: null });
                    onClose();
                  }}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer ${
                    spectator.mode === 'free'
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                  }`}
                >
                  Terbang Bebas (Free-Fly Camera)
                </button>
                <button
                  type="button"
                  onClick={() => onSetSpectator({ mode: 'off', targetSessionId: null })}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer"
                >
                  Matikan Mode Spectator
                </button>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400">Ikuti Kamera Siswa Online</div>
                {onlinePlayers.filter((p) => p.role !== 'teacher').length === 0 ? (
                  <p className="text-xs text-slate-500">Belum ada siswa online saat ini.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {onlinePlayers
                      .filter((p) => p.role !== 'teacher')
                      .map((p) => (
                        <div
                          key={p.sessionId}
                          className="p-3 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">{p.name}</div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {p.className} · Lv.{p.level}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              onSetSpectator({ mode: 'follow', targetSessionId: p.sessionId });
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer shrink-0"
                          >
                            Ikuti
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
