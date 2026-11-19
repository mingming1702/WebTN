import { SAMPLE_EXAMS, SAMPLE_SUBMISSIONS } from './sample-data.js';

const STORAGE_KEYS = {
  EXAMS: 'tv_exams_v1',
  SUBMISSIONS: 'tv_submissions_v1',
  DEMO_SEED_VERSION: 'tv_demo_seed_version',
  TEACHER_PIN: 'tv_teacher_pin_v1',
  CLOUD_CONFIG: 'tv_cloud_config_v1',
  EXAM_DRAFT_PREFIX: 'tv_exam_draft_'
};

const CURRENT_DEMO_VERSION = '2';

let cachedRuntimeConfig = null;

function readLocalJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeLocalJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureLocalSeed() {
  const existingExams = readLocalJson(STORAGE_KEYS.EXAMS, null);
  const seedVer = localStorage.getItem(STORAGE_KEYS.DEMO_SEED_VERSION);

  let exams;
  if (!Array.isArray(existingExams) || existingExams.length === 0) {
    exams = structuredClone(SAMPLE_EXAMS);
    writeLocalJson(STORAGE_KEYS.EXAMS, exams);
  } else if (seedVer !== CURRENT_DEMO_VERSION) {
    const existingIds = new Set(existingExams.map((e) => e.id));
    const missing = SAMPLE_EXAMS.filter((s) => !existingIds.has(s.id));
    exams = [...existingExams, ...structuredClone(missing)];
    writeLocalJson(STORAGE_KEYS.EXAMS, exams);
  } else {
    exams = existingExams;
  }

  const existingSubs = readLocalJson(STORAGE_KEYS.SUBMISSIONS, null);
  if ((!Array.isArray(existingSubs) || existingSubs.length === 0) && seedVer !== CURRENT_DEMO_VERSION) {
    writeLocalJson(STORAGE_KEYS.SUBMISSIONS, structuredClone(SAMPLE_SUBMISSIONS));
  }

  if (seedVer !== CURRENT_DEMO_VERSION) {
    localStorage.setItem(STORAGE_KEYS.DEMO_SEED_VERSION, CURRENT_DEMO_VERSION);
  }

  return exams;
}

export function getTeacherPin() {
  return localStorage.getItem(STORAGE_KEYS.TEACHER_PIN) || '1234';
}

export function setTeacherPin(pin) {
  localStorage.setItem(STORAGE_KEYS.TEACHER_PIN, String(pin).trim() || '1234');
}

export function getLocalCloudConfig() {
  return readLocalJson(STORAGE_KEYS.CLOUD_CONFIG, { supabaseUrl: '', supabaseAnonKey: '' });
}

export function setLocalCloudConfig(config) {
  writeLocalJson(STORAGE_KEYS.CLOUD_CONFIG, {
    supabaseUrl: (config?.supabaseUrl || '').trim().replace(/\/+$/, ''),
    supabaseAnonKey: (config?.supabaseAnonKey || '').trim()
  });
  cachedRuntimeConfig = null;
}

export async function getStorageMode() {
  if (cachedRuntimeConfig) return cachedRuntimeConfig;

  const localCfg = getLocalCloudConfig();
  if (localCfg.supabaseUrl && localCfg.supabaseAnonKey) {
    cachedRuntimeConfig = {
      mode: 'supabase',
      source: 'local-settings',
      ...localCfg
    };
    return cachedRuntimeConfig;
  }

  try {
    const res = await fetch('/api/config', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.cloudEnabled && data.supabaseUrl && data.supabaseAnonKey) {
        cachedRuntimeConfig = {
          mode: 'supabase',
          source: 'vercel-env',
          supabaseUrl: data.supabaseUrl.replace(/\/+$/, ''),
          supabaseAnonKey: data.supabaseAnonKey
        };
        return cachedRuntimeConfig;
      }
    }
  } catch {
    // Fallback to LocalStorage when running without /api/config
  }

  cachedRuntimeConfig = { mode: 'local', source: 'localstorage' };
  return cachedRuntimeConfig;
}

async function supabaseFetch(cfg, path, options = {}) {
  const headers = {
    apikey: cfg.supabaseAnonKey,
    Authorization: `Bearer ${cfg.supabaseAnonKey}`,
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const res = await fetch(`${cfg.supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase error (${res.status}): ${text}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return null;
}

function mapDbExamToApp(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    durationMinutes: row.duration_minutes ?? 40,
    isPublished: row.is_published !== false,
    singleQuestions: row.single_questions || [],
    groups: row.groups || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapAppExamToDb(exam) {
  return {
    id: exam.id,
    title: exam.title,
    description: exam.description || '',
    duration_minutes: Number(exam.durationMinutes) || 40,
    is_published: exam.isPublished !== false,
    single_questions: exam.singleQuestions || [],
    groups: exam.groups || [],
    created_at: exam.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function mapDbSubmissionToApp(row) {
  return {
    id: row.id,
    examId: row.exam_id,
    examTitle: row.exam_title,
    studentName: row.student_name,
    studentClass: row.student_class || '',
    correctCount: row.correct_count,
    totalQuestions: row.total_questions,
    score: Number(row.score),
    elapsedSeconds: row.elapsed_seconds,
    answers: row.answers || {},
    submittedAt: row.submitted_at
  };
}

function mapAppSubmissionToDb(sub) {
  return {
    id: sub.id,
    exam_id: sub.examId,
    exam_title: sub.examTitle,
    student_name: sub.studentName,
    student_class: sub.studentClass || '',
    correct_count: sub.correctCount,
    total_questions: sub.totalQuestions,
    score: sub.score,
    elapsed_seconds: sub.elapsedSeconds,
    answers: sub.answers || {},
    submitted_at: sub.submittedAt || new Date().toISOString()
  };
}

export async function listExams({ includeUnpublished = false } = {}) {
  const cfg = await getStorageMode();
  let exams = [];

  if (cfg.mode === 'supabase') {
    const rows = await supabaseFetch(cfg, 'exams?select=*&order=created_at.desc');
    if (!rows || rows.length === 0) {
      for (const sample of SAMPLE_EXAMS) {
        await supabaseFetch(cfg, 'exams', {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates' },
          body: JSON.stringify(mapAppExamToDb(sample))
        });
      }
      exams = structuredClone(SAMPLE_EXAMS);
    } else {
      exams = rows.map(mapDbExamToApp);
    }
  } else {
    exams = ensureLocalSeed();
  }

  if (!includeUnpublished) {
    return exams.filter((e) => e.isPublished !== false);
  }
  return exams;
}

export async function getExamById(examId) {
  const exams = await listExams({ includeUnpublished: true });
  return exams.find((e) => e.id === examId) || null;
}

export async function saveExam(exam) {
  const cfg = await getStorageMode();
  const now = new Date().toISOString();
  const normalized = {
    ...exam,
    durationMinutes: Number(exam.durationMinutes) || 40,
    isPublished: exam.isPublished !== false,
    createdAt: exam.createdAt || now,
    updatedAt: now
  };

  if (cfg.mode === 'supabase') {
    await supabaseFetch(cfg, 'exams?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify(mapAppExamToDb(normalized))
    });
    return normalized;
  }

  const exams = ensureLocalSeed();
  const idx = exams.findIndex((e) => e.id === normalized.id);
  if (idx >= 0) {
    exams[idx] = normalized;
  } else {
    exams.unshift(normalized);
  }
  writeLocalJson(STORAGE_KEYS.EXAMS, exams);
  return normalized;
}

export async function deleteExam(examId) {
  const cfg = await getStorageMode();
  if (cfg.mode === 'supabase') {
    await supabaseFetch(cfg, `exams?id=eq.${encodeURIComponent(examId)}`, {
      method: 'DELETE'
    });
    return;
  }

  const exams = ensureLocalSeed().filter((e) => e.id !== examId);
  writeLocalJson(STORAGE_KEYS.EXAMS, exams);
}

export async function listSubmissions({ examId = '' } = {}) {
  const cfg = await getStorageMode();
  let list = [];

  if (cfg.mode === 'supabase') {
    const query = examId
      ? `submissions?exam_id=eq.${encodeURIComponent(examId)}&select=*&order=submitted_at.desc`
      : 'submissions?select=*&order=submitted_at.desc';
    const rows = await supabaseFetch(cfg, query);
    list = (rows || []).map(mapDbSubmissionToApp);
  } else {
    ensureLocalSeed();
    list = readLocalJson(STORAGE_KEYS.SUBMISSIONS, []);
    list.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    if (examId) {
      list = list.filter((s) => s.examId === examId);
    }
  }

  return list;
}

export async function getSubmissionById(subId) {
  const list = await listSubmissions();
  return list.find((s) => s.id === subId) || null;
}

export async function saveSubmission(submission) {
  const cfg = await getStorageMode();
  if (cfg.mode === 'supabase') {
    await supabaseFetch(cfg, 'submissions', {
      method: 'POST',
      body: JSON.stringify(mapAppSubmissionToDb(submission))
    });
    return submission;
  }

  ensureLocalSeed();
  const list = readLocalJson(STORAGE_KEYS.SUBMISSIONS, []);
  list.unshift(submission);
  writeLocalJson(STORAGE_KEYS.SUBMISSIONS, list);
  return submission;
}

export async function deleteSubmission(submissionId) {
  const cfg = await getStorageMode();
  if (cfg.mode === 'supabase') {
    await supabaseFetch(cfg, `submissions?id=eq.${encodeURIComponent(submissionId)}`, {
      method: 'DELETE'
    });
    return;
  }

  const list = readLocalJson(STORAGE_KEYS.SUBMISSIONS, []).filter((s) => s.id !== submissionId);
  writeLocalJson(STORAGE_KEYS.SUBMISSIONS, list);
}

export async function resetDemoData() {
  const cfg = await getStorageMode();
  if (cfg.mode === 'supabase') {
    for (const sample of SAMPLE_EXAMS) {
      await supabaseFetch(cfg, 'exams?on_conflict=id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify(mapAppExamToDb(sample))
      });
    }
    for (const sub of SAMPLE_SUBMISSIONS) {
      await supabaseFetch(cfg, 'submissions?on_conflict=id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify(mapAppSubmissionToDb(sub))
      });
    }
    return;
  }

  writeLocalJson(STORAGE_KEYS.EXAMS, structuredClone(SAMPLE_EXAMS));
  writeLocalJson(STORAGE_KEYS.SUBMISSIONS, structuredClone(SAMPLE_SUBMISSIONS));
  localStorage.setItem(STORAGE_KEYS.DEMO_SEED_VERSION, CURRENT_DEMO_VERSION);
}

export function saveExamDraft(examId, draft) {
  writeLocalJson(`${STORAGE_KEYS.EXAM_DRAFT_PREFIX}${examId}`, draft);
}

export function loadExamDraft(examId) {
  return readLocalJson(`${STORAGE_KEYS.EXAM_DRAFT_PREFIX}${examId}`, null);
}

export function clearExamDraft(examId) {
  localStorage.removeItem(`${STORAGE_KEYS.EXAM_DRAFT_PREFIX}${examId}`);
}
