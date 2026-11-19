import { useState } from 'react';
import { X } from 'lucide-react';
import type { AvatarCustomization, CompanionType } from '../types/game';

interface AvatarStudioModalProps {
  current: AvatarCustomization;
  onSave: (next: AvatarCustomization) => void;
  onClose: () => void;
}

const SWATCHES = {
  shirt: ['#2563EB', '#DC2626', '#059669', '#D97706', '#7C3AED', '#0F172A'],
  pants: ['#1E293B', '#334155', '#1E3A8A', '#3F3F46', '#78350F', '#0F172A'],
  hair: ['#1E1B18', '#451A03', '#713F12', '#9A3412', '#CBD5E1', '#0F172A'],
  hat: ['#F59E0B', '#EF4444', '#38BDF8', '#10B981', '#A855F7', '#F8FAFC'],
};

const COMPANIONS: Array<{ id: CompanionType; name: string; subtitle: string }> = [
  { id: 'owl', name: 'Burung Hantu', subtitle: 'Penjaga Literasi' },
  { id: 'robot', name: 'EduBot Mini', subtitle: 'Asisten Grammar' },
  { id: 'fox', name: 'Rubah Cerdik', subtitle: 'Pemburu Vocab' },
  { id: 'crystal', name: 'Kristal Bahasa', subtitle: 'Energi Fokus' },
];

export function AvatarStudioModal({ current, onSave, onClose }: AvatarStudioModalProps) {
  const [draft, setDraft] = useState<AvatarCustomization>(current);

  const update = (patch: Partial<AvatarCustomization>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    onSave(next);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Studio Avatar 3D</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Studio Avatar"
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 inline-flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {(
          [
            ['Warna Baju', 'shirtColor', SWATCHES.shirt],
            ['Warna Celana', 'pantsColor', SWATCHES.pants],
            ['Warna Rambut', 'hairColor', SWATCHES.hair],
            ['Warna Topi', 'hatColor', SWATCHES.hat],
          ] as const
        ).map(([label, key, list]) => (
          <div key={key}>
            <div className="text-xs font-semibold text-slate-300 mb-2">{label}</div>
            <div className="flex items-center gap-2.5 flex-wrap">
              {list.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => update({ [key]: hex })}
                  className={`w-9 h-9 rounded-lg border-2 cursor-pointer transition-transform ${
                    draft[key] === hex ? 'border-white scale-110 ring-2 ring-sky-400' : 'border-slate-700'
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>
        ))}

        <div>
          <div className="text-xs font-semibold text-slate-300 mb-2">Pendamping 3D di Bahu</div>
          <div className="grid grid-cols-2 gap-2">
            {COMPANIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => update({ companion: c.id })}
                className={`p-3 rounded-xl border text-left cursor-pointer ${
                  draft.companion === c.id
                    ? 'bg-sky-600/25 border-sky-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <div className="text-sm font-bold">{c.name}</div>
                <div className="text-xs text-slate-400">{c.subtitle}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-11 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm cursor-pointer"
        >
          Selesai & Simpan Tampilan
        </button>
      </div>
    </div>
  );
}
