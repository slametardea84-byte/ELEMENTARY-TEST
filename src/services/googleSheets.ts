import { requestSheetsAccessToken } from './firebase';

const SHEET_ID_STORAGE_KEY = 'educity_teacher_sheet_id_v1';

export interface SheetSubmissionPayload {
  studentName: string;
  school: string;
  className: string;
  chapterTitle: string;
  correctInChapter: number;
  totalInChapter: number;
  totalScore: number;
  level: number;
  reflection: string;
  spreadsheetId?: string;
}

export interface SheetRecapRow {
  timestamp: string;
  studentName: string;
  school: string;
  className: string;
  chapterTitle: string;
  chapterScore: string;
  totalScore: string;
  level: string;
  reflection: string;
}

export function getSavedTeacherSheetId(): string {
  return localStorage.getItem(SHEET_ID_STORAGE_KEY) || '';
}

export function setSavedTeacherSheetId(sheetId: string): void {
  if (sheetId.trim()) {
    localStorage.setItem(SHEET_ID_STORAGE_KEY, sheetId.trim());
  }
}

async function getFirstSheetTabTitle(accessToken: string, spreadsheetId: string): Promise<string> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?fields=sheets.properties.title`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gagal membaca metadata Google Sheet (${res.status}): ${errText}`);
  }
  const data = (await res.json()) as {
    sheets?: Array<{ properties?: { title?: string } }>;
  };
  return data.sheets?.[0]?.properties?.title || 'Sheet1';
}

async function createTeacherSpreadsheet(accessToken: string): Promise<{ spreadsheetId: string; tabTitle: string }> {
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: 'EduCity 3D — Rekap Bahasa Inggris SMP',
      },
      sheets: [
        {
          properties: { title: 'Rekap_Siswa' },
        },
      ],
    }),
  });
  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Gagal membuat Google Sheet baru (${createRes.status}): ${errText}`);
  }
  const created = (await createRes.json()) as { spreadsheetId: string };
  const tabTitle = 'Rekap_Siswa';

  // Write header row
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${created.spreadsheetId}/values/${encodeURIComponent(tabTitle)}!A1:I1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [
          [
            'Waktu Kirim',
            'Nama Siswa',
            'Asal Sekolah',
            'Kelas',
            'Bab Materi',
            'Skor Bab',
            'Total Skor',
            'Level',
            'Refleksi Siswa',
          ],
        ],
      }),
    }
  );

  setSavedTeacherSheetId(created.spreadsheetId);
  return { spreadsheetId: created.spreadsheetId, tabTitle };
}

export async function submitProgressToGoogleSheet(
  payload: SheetSubmissionPayload
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const accessToken = await requestSheetsAccessToken();

  let spreadsheetId = payload.spreadsheetId?.trim() || getSavedTeacherSheetId();
  let tabTitle = 'Rekap_Siswa';

  if (!spreadsheetId) {
    // Search Drive for existing sheet created by this app
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        "name='EduCity 3D — Rekap Bahasa Inggris SMP' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false"
      )}&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (searchRes.ok) {
      const searchData = (await searchRes.json()) as { files?: Array<{ id: string }> };
      if (searchData.files && searchData.files.length > 0) {
        spreadsheetId = searchData.files[0].id;
        setSavedTeacherSheetId(spreadsheetId);
      }
    }
  }

  if (!spreadsheetId) {
    const created = await createTeacherSpreadsheet(accessToken);
    spreadsheetId = created.spreadsheetId;
    tabTitle = created.tabTitle;
  } else {
    tabTitle = await getFirstSheetTabTitle(accessToken, spreadsheetId);
    setSavedTeacherSheetId(spreadsheetId);
  }

  const nowStr = new Date().toLocaleString('id-ID');
  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(
      `${tabTitle}!A:I`
    )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [
          [
            nowStr,
            payload.studentName,
            payload.school,
            payload.className,
            payload.chapterTitle,
            `${payload.correctInChapter}/${payload.totalInChapter}`,
            String(payload.totalScore),
            String(payload.level),
            payload.reflection || '-',
          ],
        ],
      }),
    }
  );

  if (!appendRes.ok) {
    const errText = await appendRes.text();
    throw new Error(`Gagal mengirim baris ke Google Sheet (${appendRes.status}): ${errText}`);
  }

  return {
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
}

export async function readTeacherSheetRecap(
  explicitSheetId?: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; rows: SheetRecapRow[] }> {
  const accessToken = await requestSheetsAccessToken();
  let spreadsheetId = explicitSheetId?.trim() || getSavedTeacherSheetId();

  if (!spreadsheetId) {
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        "name='EduCity 3D — Rekap Bahasa Inggris SMP' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false"
      )}&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (searchRes.ok) {
      const searchData = (await searchRes.json()) as { files?: Array<{ id: string }> };
      if (searchData.files && searchData.files.length > 0) {
        spreadsheetId = searchData.files[0].id;
        setSavedTeacherSheetId(spreadsheetId);
      }
    }
  }

  if (!spreadsheetId) {
    const created = await createTeacherSpreadsheet(accessToken);
    spreadsheetId = created.spreadsheetId;
  }

  const tabTitle = await getFirstSheetTabTitle(accessToken, spreadsheetId);
  const valRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(
      `${tabTitle}!A2:I200`
    )}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!valRes.ok) {
    throw new Error(`Gagal membaca isi Google Sheet (${valRes.status})`);
  }
  const valData = (await valRes.json()) as { values?: string[][] };
  const rows: SheetRecapRow[] = (valData.values || []).map((r) => ({
    timestamp: r[0] || '-',
    studentName: r[1] || '-',
    school: r[2] || '-',
    className: r[3] || '-',
    chapterTitle: r[4] || '-',
    chapterScore: r[5] || '-',
    totalScore: r[6] || '0',
    level: r[7] || '1',
    reflection: r[8] || '-',
  }));

  return {
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    rows,
  };
}
