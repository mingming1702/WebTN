import { generateId } from '../core/id.js';

export const OPTION_KEYS = ['A', 'B', 'C', 'D'];
export const SINGLE_SECTION_LIMIT = 20;
export const GROUP_SECTION_LIMIT = 5;
export const STANDARD_QUESTION_COUNT = 30;
export const EXAM_MODES = {
  PRACTICE: 'practice',
  TIMED: 'timed'
};

export function createEmptyQuestion(number = 1, overrides = {}) {
  const correct = String(overrides.correctAnswer || 'A').toUpperCase();
  return {
    number,
    question: String(overrides.question ?? ''),
    options: {
      A: String(overrides.options?.A ?? ''),
      B: String(overrides.options?.B ?? ''),
      C: String(overrides.options?.C ?? ''),
      D: String(overrides.options?.D ?? '')
    },
    correctAnswer: OPTION_KEYS.includes(correct) ? correct : 'A',
    explanation: String(overrides.explanation ?? '')
  };
}

export function createEmptyGroup(index = 0, { prefillQuestions = false } = {}) {
  const isFirst = index === 0;
  const startNum = isFirst ? 21 : 26;
  return {
    id: isFirst ? 'group_1' : 'group_2',
    title: isFirst ? 'Ngữ liệu đọc hiểu 1 (Câu 21 - 25)' : 'Ngữ liệu đọc hiểu 2 (Câu 26 - 30)',
    passageTitle: '',
    passage: '',
    questions: prefillQuestions
      ? Array.from({ length: GROUP_SECTION_LIMIT }, (_, i) => createEmptyQuestion(startNum + i))
      : []
  };
}

export function createEmptyExamTemplate({ prefillQuestions = false, isPublished = false } = {}) {
  const now = new Date().toISOString();
  return {
    id: generateId('exam'),
    title: '',
    description: '',
    durationMinutes: 40,
    isPublished,
    singleQuestions: prefillQuestions
      ? Array.from({ length: SINGLE_SECTION_LIMIT }, (_, i) => createEmptyQuestion(i + 1))
      : [],
    groups: [
      createEmptyGroup(0, { prefillQuestions }),
      createEmptyGroup(1, { prefillQuestions })
    ],
    createdAt: now,
    updatedAt: now
  };
}

export function normalizeQuestion(raw = {}, number = 1) {
  const correct = String(raw.correctAnswer || 'A').toUpperCase();
  return {
    number,
    question: String(raw.question ?? ''),
    options: {
      A: String(raw.options?.A ?? ''),
      B: String(raw.options?.B ?? ''),
      C: String(raw.options?.C ?? ''),
      D: String(raw.options?.D ?? '')
    },
    correctAnswer: OPTION_KEYS.includes(correct) ? correct : 'A',
    explanation: String(raw.explanation ?? '')
  };
}

export function renumberExamQuestions(exam) {
  const cloned = structuredClone(exam);
  cloned.singleQuestions = (cloned.singleQuestions || [])
    .slice(0, SINGLE_SECTION_LIMIT)
    .map((q, idx) => normalizeQuestion(q, idx + 1));

  const rawGroups = Array.isArray(cloned.groups) ? cloned.groups : [];
  cloned.groups = [0, 1].map((gIdx) => {
    const base = createEmptyGroup(gIdx, { prefillQuestions: false });
    const src = rawGroups[gIdx] || {};
    const startNum = gIdx === 0 ? 21 : 26;
    const questions = Array.isArray(src.questions)
      ? src.questions.slice(0, GROUP_SECTION_LIMIT).map((q, qIdx) => normalizeQuestion(q, startNum + qIdx))
      : [];
    return {
      ...base,
      id: src.id || base.id,
      title: src.title || base.title,
      passageTitle: String(src.passageTitle ?? ''),
      passage: String(src.passage ?? ''),
      questions
    };
  });

  return cloned;
}

export function normalizeExam(raw = {}) {
  const now = new Date().toISOString();
  const base = {
    id: String(raw.id || generateId('exam')),
    title: String(raw.title ?? ''),
    description: String(raw.description ?? ''),
    durationMinutes: Math.min(180, Math.max(1, Number(raw.durationMinutes) || 40)),
    isPublished: raw.isPublished !== false,
    singleQuestions: Array.isArray(raw.singleQuestions) ? raw.singleQuestions : [],
    groups: Array.isArray(raw.groups) ? raw.groups : [],
    createdAt: raw.createdAt || now,
    updatedAt: raw.updatedAt || now
  };
  return renumberExamQuestions(base);
}

export function flattenExamQuestions(exam) {
  if (!exam) return [];
  const list = [];
  (exam.singleQuestions || []).forEach((q, idx) => {
    list.push({
      ...q,
      number: idx + 1,
      section: 'single',
      groupIndex: null
    });
  });

  (exam.groups || []).forEach((group, gIdx) => {
    const startNumber = gIdx === 0 ? 21 : 26;
    (group.questions || []).forEach((q, qIdx) => {
      list.push({
        ...q,
        number: startNumber + qIdx,
        section: `group-${gIdx + 1}`,
        groupIndex: gIdx,
        passageTitle: group.passageTitle || '',
        passage: group.passage || ''
      });
    });
  });

  return list;
}

export function isQuestionComplete(q) {
  return Boolean(
    q &&
      String(q.question || '').trim() &&
      OPTION_KEYS.every((k) => String(q.options?.[k] || '').trim()) &&
      OPTION_KEYS.includes(q.correctAnswer)
  );
}

export function getExamCompletionSummary(exam) {
  const single = exam?.singleQuestions || [];
  const g1 = exam?.groups?.[0]?.questions || [];
  const g2 = exam?.groups?.[1]?.questions || [];
  const all = [...single, ...g1, ...g2];
  const completedCount = all.filter(isQuestionComplete).length;
  const hasGroup1Passage = Boolean(String(exam?.groups?.[0]?.passage || '').trim());
  const hasGroup2Passage = Boolean(String(exam?.groups?.[1]?.passage || '').trim());

  return {
    singleCount: single.length,
    group1Count: g1.length,
    group2Count: g2.length,
    totalExisting: all.length,
    completedCount,
    targetTotal: STANDARD_QUESTION_COUNT,
    hasGroup1Passage,
    hasGroup2Passage,
    isComplete30:
      single.length === SINGLE_SECTION_LIMIT &&
      g1.length === GROUP_SECTION_LIMIT &&
      g2.length === GROUP_SECTION_LIMIT &&
      completedCount === STANDARD_QUESTION_COUNT &&
      hasGroup1Passage &&
      hasGroup2Passage
  };
}

export function validateQuestionInput(q, label = 'Câu hỏi') {
  const errors = [];
  if (!q?.question || !String(q.question).trim()) {
    errors.push(`${label} chưa có nội dung câu hỏi.`);
  }
  OPTION_KEYS.forEach((k) => {
    if (!q?.options?.[k] || !String(q.options[k]).trim()) {
      errors.push(`${label} thiếu phương án ${k}.`);
    }
  });
  if (!OPTION_KEYS.includes(q?.correctAnswer)) {
    errors.push(`${label} chưa chọn đáp án đúng.`);
  }
  return errors;
}

export function validateExam(exam, { strict30 = true } = {}) {
  const errors = [];
  if (!exam?.title || !String(exam.title).trim()) {
    errors.push('Vui lòng nhập tên bài tập.');
  }

  const duration = Number(exam?.durationMinutes);
  if (!Number.isFinite(duration) || duration < 1 || duration > 180) {
    errors.push('Thời gian gợi ý phải từ 1 đến 180 phút.');
  }

  const singles = Array.isArray(exam?.singleQuestions) ? exam.singleQuestions : [];
  if (strict30 && singles.length !== SINGLE_SECTION_LIMIT) {
    errors.push(`Phần I phải có đủ ${SINGLE_SECTION_LIMIT} câu đơn (hiện có ${singles.length}/${SINGLE_SECTION_LIMIT} câu).`);
  }
  singles.forEach((q, idx) => {
    errors.push(...validateQuestionInput(q, `Câu ${idx + 1}`));
  });

  const groups = Array.isArray(exam?.groups) ? exam.groups : [];
  if (strict30 && groups.length !== 2) {
    errors.push('Bài tập chuẩn phải có đủ 2 nhóm đọc hiểu (Câu 21–25 và Câu 26–30).');
  }

  groups.forEach((group, gIdx) => {
    const label = gIdx === 0 ? 'Nhóm đọc hiểu 1 (Câu 21–25)' : 'Nhóm đọc hiểu 2 (Câu 26–30)';
    const startNum = gIdx === 0 ? 21 : 26;
    const qs = Array.isArray(group?.questions) ? group.questions : [];
    const hasPassage = Boolean(group?.passage && String(group.passage).trim());

    if ((strict30 || qs.length > 0) && !hasPassage) {
      errors.push(`${label} chưa có đoạn văn bản / ngữ liệu.`);
    }
    if (strict30 && qs.length !== GROUP_SECTION_LIMIT) {
      errors.push(`${label} phải có đủ ${GROUP_SECTION_LIMIT} câu hỏi (hiện có ${qs.length}/${GROUP_SECTION_LIMIT} câu).`);
    }
    qs.forEach((q, qIdx) => {
      errors.push(...validateQuestionInput(q, `Câu ${startNum + qIdx}`));
    });
  });

  if (!strict30 && singles.length === 0 && groups.every((g) => (g.questions || []).length === 0)) {
    errors.push('Vui lòng thêm ít nhất 1 câu hỏi trước khi lưu nháp.');
  }

  return errors;
}
