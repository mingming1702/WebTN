import { SAMPLE_EXAMS, SAMPLE_SUBMISSIONS } from '../sample-data.js';
import { normalizeExam } from './exam.model.js';

export const STORAGE_KEYS = {
  EXAMS: 'tv_exams_v1',
  SUBMISSIONS: 'tv_submissions_v1',
  MY_SUBMISSION_IDS: 'tv_my_submission_ids_v1',
  DEMO_SEED_VERSION: 'tv_demo_seed_version',
  DELETED_SAMPLE_IDS: 'tv_deleted_sample_ids_v1',
  TEACHER_PIN: 'tv_teacher_pin_v1',
  CLOUD_CONFIG: 'tv_cloud_config_v1',
  EXAM_DRAFT_PREFIX: 'tv_exam_draft_',
  LAST_STUDENT_NAME: 'tv_last_student_name'
};

export const CURRENT_DEMO_VERSION = '5';
export const SAMPLE_CONTENT_VERSION = '2026-11-20T20:40:00.000Z';
export const LEGACY_SAMPLE_EXAM_IDS = new Set(['exam_tv_mau_01', 'exam_tv_mau_02']);

export function normalizeSupabaseUrl(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    return parsed.origin;
  } catch {
    return trimmed.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
  }
}

function mapDbExamToApp(row) {
  return normalizeExam({
    id: row.id,
    title: row.title,
    description: row.description || '',
    durationMinutes: row.duration_minutes ?? 40,
    isPublished: row.is_published !== false,
    singleQuestions: row.single_questions || [],
    groups: row.groups || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });
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
    updated_at: exam.updatedAt || new Date().toISOString()
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

export function createStorageRepository({
  localStore = typeof localStorage !== 'undefined' ? localStorage : null,
  sessionStore = typeof sessionStorage !== 'undefined' ? sessionStorage : null,
  fetchImpl = typeof fetch !== 'undefined' ? fetch.bind(globalThis) : null
} = {}) {
  let cachedRuntimeConfig = null;

  function readLocalJson(key, fallback) {
    if (!localStore) return fallback;
    try {
      const raw = localStore.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function writeLocalJson(key, value) {
    if (!localStore) return;
    localStore.setItem(key, JSON.stringify(value));
  }

  function addMySubmissionId(subId) {
    if (!subId) return;
    const ids = readLocalJson(STORAGE_KEYS.MY_SUBMISSION_IDS, []);
    const list = Array.isArray(ids) ? ids : [];
    if (!list.includes(subId)) {
      list.unshift(subId);
      writeLocalJson(STORAGE_KEYS.MY_SUBMISSION_IDS, list.slice(0, 100));
    }
  }

  function getDeletedSampleIds() {
    return new Set(readLocalJson(STORAGE_KEYS.DELETED_SAMPLE_IDS, []));
  }

  function markSampleDeleted(examId) {
    const set = getDeletedSampleIds();
    set.add(examId);
    writeLocalJson(STORAGE_KEYS.DELETED_SAMPLE_IDS, Array.from(set));
  }

  function ensureLocalSeed() {
    const existingExams = readLocalJson(STORAGE_KEYS.EXAMS, null);
    const seedVer = localStore?.getItem(STORAGE_KEYS.DEMO_SEED_VERSION);

    let exams;
    if (!Array.isArray(existingExams)) {
      exams = structuredClone(SAMPLE_EXAMS).map(normalizeExam);
      writeLocalJson(STORAGE_KEYS.EXAMS, exams);
    } else if (seedVer !== CURRENT_DEMO_VERSION) {
      const sampleMap = new Map(SAMPLE_EXAMS.map((s) => [s.id, normalizeExam(s)]));
      const keptExams = existingExams
        .filter((e) => !LEGACY_SAMPLE_EXAM_IDS.has(e.id))
        .map((e) => (sampleMap.has(e.id) ? structuredClone(sampleMap.get(e.id)) : normalizeExam(e)));
      const keptIds = new Set(keptExams.map((e) => e.id));
      const deletedIds = getDeletedSampleIds();
      const missing = SAMPLE_EXAMS.filter((s) => !keptIds.has(s.id) && !deletedIds.has(s.id)).map(normalizeExam);
      exams = [...structuredClone(missing), ...keptExams];
      writeLocalJson(STORAGE_KEYS.EXAMS, exams);
    } else {
      exams = existingExams.map(normalizeExam);
    }

    const existingSubs = readLocalJson(STORAGE_KEYS.SUBMISSIONS, null);
    if (seedVer !== CURRENT_DEMO_VERSION) {
      const cleanedSubs = Array.isArray(existingSubs)
        ? existingSubs.filter((s) => !LEGACY_SAMPLE_EXAM_IDS.has(s.examId))
        : [];
      writeLocalJson(STORAGE_KEYS.SUBMISSIONS, cleanedSubs);
      localStore?.setItem(STORAGE_KEYS.DEMO_SEED_VERSION, CURRENT_DEMO_VERSION);
    }

    return exams;
  }

  async function supabaseFetch(cfg, path, options = {}) {
    if (!fetchImpl) throw new Error('Fetch API is not available.');
    const headers = {
      apikey: cfg.supabaseAnonKey,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (!cfg.supabaseAnonKey.startsWith('sb_publishable_')) {
      headers.Authorization = `Bearer ${cfg.supabaseAnonKey}`;
    }

    const res = await fetchImpl(`${cfg.supabaseUrl}/rest/v1/${path}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      const text = await res.text();
      if (text.includes('PGRST205')) {
        throw new Error(
          `Chưa tìm thấy bảng exams/submissions trên Supabase. Hãy mở Supabase SQL Editor và chạy file supabase/schema.sql. (${text})`
        );
      }
      if (text.includes('42501')) {
        throw new Error(
          `Bảng trên Supabase chưa được cấp quyền cho role anon. Hãy mở Supabase SQL Editor và chạy lại toàn bộ file supabase/schema.sql mới nhất (có lệnh GRANT). (${text})`
        );
      }
      throw new Error(`Supabase error (${res.status}): ${text}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return res.json();
    }
    return null;
  }

  return {
    getTeacherPin() {
      const stored = localStore?.getItem(STORAGE_KEYS.TEACHER_PIN);
      return stored && stored !== '1234' ? stored : '1702';
    },

    setTeacherPin(pin) {
      localStore?.setItem(STORAGE_KEYS.TEACHER_PIN, String(pin).trim() || '1702');
    },

    isTeacherSessionUnlocked() {
      return sessionStore?.getItem('tv_teacher_unlocked') === '1';
    },

    setTeacherSessionUnlocked(unlocked) {
      if (!sessionStore) return;
      if (unlocked) {
        sessionStore.setItem('tv_teacher_unlocked', '1');
      } else {
        sessionStore.removeItem('tv_teacher_unlocked');
      }
    },

    getLastStudentName() {
      return localStore?.getItem(STORAGE_KEYS.LAST_STUDENT_NAME) || '';
    },

    setLastStudentName(name) {
      if (!localStore) return;
      localStore.setItem(STORAGE_KEYS.LAST_STUDENT_NAME, String(name || '').trim());
    },

    getLocalCloudConfig() {
      return readLocalJson(STORAGE_KEYS.CLOUD_CONFIG, { supabaseUrl: '', supabaseAnonKey: '' });
    },

    setLocalCloudConfig(config) {
      writeLocalJson(STORAGE_KEYS.CLOUD_CONFIG, {
        supabaseUrl: normalizeSupabaseUrl(config?.supabaseUrl),
        supabaseAnonKey: String(config?.supabaseAnonKey || '').trim()
      });
      cachedRuntimeConfig = null;
    },

    clearRuntimeConfigCache() {
      cachedRuntimeConfig = null;
    },

    async getStorageMode() {
      if (cachedRuntimeConfig) return cachedRuntimeConfig;

      const localCfg = this.getLocalCloudConfig();
      if (localCfg.supabaseUrl && localCfg.supabaseAnonKey) {
        cachedRuntimeConfig = {
          mode: 'supabase',
          source: 'local-settings',
          supabaseUrl: normalizeSupabaseUrl(localCfg.supabaseUrl),
          supabaseAnonKey: localCfg.supabaseAnonKey.trim()
        };
        return cachedRuntimeConfig;
      }

      if (fetchImpl) {
        try {
          const res = await fetchImpl('/api/config', { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            if (data.cloudEnabled && data.supabaseUrl && data.supabaseAnonKey) {
              cachedRuntimeConfig = {
                mode: 'supabase',
                source: 'vercel-env',
                supabaseUrl: normalizeSupabaseUrl(data.supabaseUrl),
                supabaseAnonKey: String(data.supabaseAnonKey).trim()
              };
              return cachedRuntimeConfig;
            }
          }
        } catch {
          // Fallback to LocalStorage when running without /api/config
        }
      }

      cachedRuntimeConfig = { mode: 'local', source: 'localstorage' };
      return cachedRuntimeConfig;
    },

    async listExams({ includeUnpublished = false } = {}) {
      const cfg = await this.getStorageMode();
      let exams = [];

      if (cfg.mode === 'supabase') {
        let rows = (await supabaseFetch(cfg, 'exams?select=*&order=created_at.desc')) || [];
        const legacyRows = rows.filter((r) => LEGACY_SAMPLE_EXAM_IDS.has(r.id));

        if (legacyRows.length > 0) {
          await Promise.all(
            legacyRows.map((r) =>
              supabaseFetch(cfg, `exams?id=eq.${encodeURIComponent(r.id)}`, { method: 'DELETE' })
            )
          );
        }

        const nonLegacyRows = rows.filter((r) => !LEGACY_SAMPLE_EXAM_IDS.has(r.id));
        const existingMap = new Map(nonLegacyRows.map((r) => [r.id, r]));
        const deletedIds = getDeletedSampleIds();
        const isFreshEmptyDb = nonLegacyRows.length === 0;

        // Only insert missing sample exams when the DB is completely empty so deletions on one device
        // are not silently resurrected by another device. Existing samples still upgrade if outdated.
        const samplesToSync = SAMPLE_EXAMS.filter((s) => {
          if (deletedIds.has(s.id)) return false;
          const existing = existingMap.get(s.id);
          if (!existing) return isFreshEmptyDb;
          return !existing.updated_at || existing.updated_at < SAMPLE_CONTENT_VERSION;
        });

        if (samplesToSync.length > 0) {
          await Promise.all(
            samplesToSync.map((sample) =>
              supabaseFetch(cfg, 'exams?on_conflict=id', {
                method: 'POST',
                headers: { Prefer: 'resolution=merge-duplicates' },
                body: JSON.stringify(mapAppExamToDb(sample))
              })
            )
          );
        }

        if (legacyRows.length > 0 || samplesToSync.length > 0) {
          rows = (await supabaseFetch(cfg, 'exams?select=*&order=created_at.desc')) || [];
        }

        exams = rows.map(mapDbExamToApp);
      } else {
        exams = ensureLocalSeed();
      }

      if (!includeUnpublished) {
        return exams.filter((e) => e.isPublished !== false);
      }
      return exams;
    },

    async getExamById(examId) {
      const exams = await this.listExams({ includeUnpublished: true });
      return exams.find((e) => e.id === examId) || null;
    },

    async saveExam(exam) {
      const cfg = await this.getStorageMode();
      const now = new Date().toISOString();
      const normalized = normalizeExam({
        ...exam,
        createdAt: exam.createdAt || now,
        updatedAt: now
      });

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
    },

    async deleteExam(examId) {
      markSampleDeleted(examId);
      const cfg = await this.getStorageMode();
      if (cfg.mode === 'supabase') {
        await supabaseFetch(cfg, `exams?id=eq.${encodeURIComponent(examId)}`, {
          method: 'DELETE'
        });
        return;
      }

      const exams = ensureLocalSeed().filter((e) => e.id !== examId);
      writeLocalJson(STORAGE_KEYS.EXAMS, exams);
    },

    async listSubmissions({ examId = '' } = {}) {
      const cfg = await this.getStorageMode();
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
    },

    isMySubmission(subId) {
      if (!subId) return false;
      const ids = readLocalJson(STORAGE_KEYS.MY_SUBMISSION_IDS, []);
      return Array.isArray(ids) && ids.includes(subId);
    },

    async listMySubmissions({ examId = '' } = {}) {
      const ids = readLocalJson(STORAGE_KEYS.MY_SUBMISSION_IDS, []);
      if (!Array.isArray(ids) || ids.length === 0) {
        return [];
      }
      const mySet = new Set(ids);
      const all = await this.listSubmissions({ examId });
      return all.filter((s) => mySet.has(s.id));
    },

    async getSubmissionById(subId) {
      const list = await this.listSubmissions();
      return list.find((s) => s.id === subId) || null;
    },

    async saveSubmission(submission) {
      const cfg = await this.getStorageMode();
      if (cfg.mode === 'supabase') {
        await supabaseFetch(cfg, 'submissions', {
          method: 'POST',
          body: JSON.stringify(mapAppSubmissionToDb(submission))
        });
        addMySubmissionId(submission.id);
        return submission;
      }

      ensureLocalSeed();
      const list = readLocalJson(STORAGE_KEYS.SUBMISSIONS, []);
      list.unshift(submission);
      writeLocalJson(STORAGE_KEYS.SUBMISSIONS, list);
      addMySubmissionId(submission.id);
      return submission;
    },

    async deleteSubmission(submissionId) {
      const cfg = await this.getStorageMode();
      if (cfg.mode === 'supabase') {
        await supabaseFetch(cfg, `submissions?id=eq.${encodeURIComponent(submissionId)}`, {
          method: 'DELETE'
        });
        return;
      }

      const list = readLocalJson(STORAGE_KEYS.SUBMISSIONS, []).filter((s) => s.id !== submissionId);
      writeLocalJson(STORAGE_KEYS.SUBMISSIONS, list);
    },

    async resetDemoData() {
      localStore?.removeItem(STORAGE_KEYS.DELETED_SAMPLE_IDS);
      const cfg = await this.getStorageMode();
      if (cfg.mode === 'supabase') {
        for (const legacyId of LEGACY_SAMPLE_EXAM_IDS) {
          await supabaseFetch(cfg, `exams?id=eq.${encodeURIComponent(legacyId)}`, {
            method: 'DELETE'
          });
        }
        for (const sample of SAMPLE_EXAMS) {
          await supabaseFetch(cfg, 'exams?on_conflict=id', {
            method: 'POST',
            headers: { Prefer: 'resolution=merge-duplicates' },
            body: JSON.stringify(mapAppExamToDb(normalizeExam(sample)))
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

      writeLocalJson(STORAGE_KEYS.EXAMS, structuredClone(SAMPLE_EXAMS).map(normalizeExam));
      writeLocalJson(STORAGE_KEYS.SUBMISSIONS, structuredClone(SAMPLE_SUBMISSIONS));
      localStore?.setItem(STORAGE_KEYS.DEMO_SEED_VERSION, CURRENT_DEMO_VERSION);
    },

    saveExamDraft(examId, draft) {
      writeLocalJson(`${STORAGE_KEYS.EXAM_DRAFT_PREFIX}${examId}`, draft);
    },

    loadExamDraft(examId) {
      return readLocalJson(`${STORAGE_KEYS.EXAM_DRAFT_PREFIX}${examId}`, null);
    },

    clearExamDraft(examId) {
      localStore?.removeItem(`${STORAGE_KEYS.EXAM_DRAFT_PREFIX}${examId}`);
    }
  };
}

export const defaultRepository = createStorageRepository();
