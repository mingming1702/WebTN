import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createEmptyExamTemplate,
  createEmptyQuestion,
  flattenExamQuestions,
  getExamCompletionSummary,
  normalizeExam,
  validateExam
} from '../public/js/models/exam.model.js';
import { computeSubmissionStats, computeTopWrongQuestions, gradeExam } from '../public/js/models/grading.model.js';
import { buildQuickSampleText30, parseQuickText } from '../public/js/models/quick-parser.model.js';
import { createStorageRepository } from '../public/js/models/storage.repository.js';
import { SAMPLE_EXAMS } from '../public/js/sample-data.js';

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem(k) {
      return map.has(k) ? map.get(k) : null;
    },
    setItem(k, v) {
      map.set(k, String(v));
    },
    removeItem(k) {
      map.delete(k);
    }
  };
}

test('empty exam template starts at 0 questions for incremental authoring', () => {
  const exam = createEmptyExamTemplate();
  assert.equal(exam.singleQuestions.length, 0);
  assert.equal(exam.groups.length, 2);
  assert.equal(exam.groups[0].questions.length, 0);
  assert.equal(exam.groups[1].questions.length, 0);
  assert.equal(exam.isPublished, false);

  const summary = getExamCompletionSummary(exam);
  assert.equal(summary.totalExisting, 0);
  assert.equal(summary.isComplete30, false);
});

test('validateExam allows partial draft when strict30=false and enforces 30 questions when strict30=true', () => {
  const exam = createEmptyExamTemplate();
  exam.title = 'Bài tập Tuần 1';
  exam.singleQuestions.push(
    createEmptyQuestion(1, {
      question: 'Từ nào đúng chính tả?',
      options: { A: 'Sáng sủa', B: 'Xáng sủa', C: 'Sáng xủa', D: 'Xáng xủa' },
      correctAnswer: 'A'
    })
  );

  assert.deepEqual(validateExam(exam, { strict30: false }), []);
  const strictErrors = validateExam(exam, { strict30: true });
  assert.ok(strictErrors.length >= 3);
});

test('normalizeExam safely fills missing groups and renumbers questions', () => {
  const normalized = normalizeExam({
    title: 'Imported JSON',
    singleQuestions: [{ question: 'Q1', options: { A: '1', B: '2', C: '3', D: '4' }, correctAnswer: 'c' }]
  });
  assert.equal(normalized.groups.length, 2);
  assert.equal(normalized.singleQuestions[0].number, 1);
  assert.equal(normalized.singleQuestions[0].correctAnswer, 'C');
});

test('parseQuickText populates empty incremental template with 30 questions, passages and explanations', () => {
  const empty = createEmptyExamTemplate();
  const sampleText = `${buildQuickSampleText30()}\nGiải thích: Giải thích câu 30.`;
  const { exam, updatedCount } = parseQuickText(sampleText, empty);

  assert.equal(updatedCount, 30);
  assert.equal(flattenExamQuestions(exam).length, 30);
  assert.equal(exam.groups[0].passageTitle, 'Kỷ niệm mùa thu đến trường');
  assert.ok(exam.groups[0].passage.includes('Sáng thu, bầu trời trong xanh'));
  assert.equal(exam.groups[1].passageTitle, 'Vai trò của cây xanh đô thị');
  assert.ok(exam.groups[1].passage.includes('Cây xanh đô thị'));
  assert.equal(exam.groups[1].questions[4].explanation, 'Giải thích câu 30.');
  assert.deepEqual(validateExam({ ...exam, title: 'Đề test' }, { strict30: true }), []);
});

test('gradeExam calculates score out of 30 and section breakdown accurately', () => {
  const sample = normalizeExam(SAMPLE_EXAMS[0]);
  const flat = flattenExamQuestions(sample);
  const answers = {};
  flat.forEach((q, idx) => {
    answers[String(q.number)] = idx < 25 ? q.correctAnswer : 'Z';
  });

  const result = gradeExam(sample, answers);
  assert.equal(result.correctCount, 25);
  assert.equal(result.score, 25);
  assert.equal(result.scoreScale, 30);
  assert.equal(result.sectionBreakdown.single.correct, 20);
  assert.equal(result.sectionBreakdown.group1.correct, 5);
  assert.equal(result.sectionBreakdown.group2.correct, 0);

  const stats = computeSubmissionStats([{ score: 25, correctCount: 25, totalQuestions: 30 }]);
  assert.equal(stats.highRate, 100);

  const topWrong = computeTopWrongQuestions([{ examId: sample.id, answers }], [sample], 2);
  assert.equal(topWrong.length, 2);
  assert.equal(topWrong[0].wrong, 1);
});

test('storage repository deletes sample exam locally and does not resurrect deleted samples on Supabase list', async () => {
  const localStore = createMemoryStorage();
  localStore.setItem(
    'tv_cloud_config_v1',
    JSON.stringify({ supabaseUrl: 'https://demo.supabase.co', supabaseAnonKey: 'sb_publishable_123' })
  );

  // Simulate remote Supabase DB that already has 4 exams (exam_dgnl_de_11 was deleted by teacher on another device)
  const remoteRows = SAMPLE_EXAMS.slice(1).map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    duration_minutes: e.durationMinutes,
    is_published: e.isPublished,
    single_questions: e.singleQuestions,
    groups: e.groups,
    created_at: e.createdAt,
    updated_at: '2026-11-21T00:00:00.000Z'
  }));

  const postCalls = [];
  const fetchImpl = async (url, options = {}) => {
    if (options.method === 'POST') {
      postCalls.push(url);
    }
    return {
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => remoteRows
    };
  };

  const repo = createStorageRepository({ localStore, sessionStore: createMemoryStorage(), fetchImpl });
  const list = await repo.listExams({ includeUnpublished: true });
  assert.equal(list.length, 4);
  assert.equal(postCalls.length, 0);
});
