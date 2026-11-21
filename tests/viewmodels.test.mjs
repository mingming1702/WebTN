import test from 'node:test';
import assert from 'node:assert/strict';

import { EXAM_MODES, normalizeExam } from '../public/js/models/exam.model.js';
import { createStorageRepository } from '../public/js/models/storage.repository.js';
import { SAMPLE_EXAMS } from '../public/js/sample-data.js';
import { HomeViewModel } from '../public/js/viewmodels/home.viewmodel.js';
import { TeacherAuthViewModel } from '../public/js/viewmodels/teacher-auth.viewmodel.js';
import { EDITOR_SECTIONS, TeacherEditorViewModel } from '../public/js/viewmodels/teacher-editor.viewmodel.js';
import { TeacherScoresViewModel } from '../public/js/viewmodels/teacher-scores.viewmodel.js';
import { WorkspaceViewModel } from '../public/js/viewmodels/workspace.viewmodel.js';

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

function createTestRepo() {
  return createStorageRepository({
    localStore: createMemoryStorage(),
    sessionStore: createMemoryStorage(),
    fetchImpl: null
  });
}

test('TeacherAuthViewModel enforces PIN strictly with no bypass', async () => {
  const repo = createTestRepo();
  const authVm = new TeacherAuthViewModel(repo);
  await authVm.init();
  assert.equal(authVm.state.unlocked, false);

  assert.equal(authVm.verifyPin('9999'), false);
  assert.equal(authVm.state.unlocked, false);
  assert.ok(authVm.state.pinError.length > 0);

  assert.equal(authVm.verifyPin('1234'), true);
  assert.equal(authVm.state.unlocked, true);
  assert.equal(authVm.state.pinError, '');

  authVm.lock();
  assert.equal(authVm.state.unlocked, false);
});

test('TeacherEditorViewModel supports adding questions one by one, reordering, deleting, and saving draft', async () => {
  const repo = createTestRepo();
  const editorVm = new TeacherEditorViewModel(repo);

  editorVm.openNew();
  assert.equal(editorVm.state.exam.singleQuestions.length, 0);
  assert.equal(editorVm.getActiveQuestionDisplayNumber(), 1);

  editorVm.updateExamMeta({ title: 'Bài tập soạn từng câu' });

  // Add Question 1 and advance
  editorVm.updateQuestionFormField('question', 'Câu hỏi thứ nhất?');
  editorVm.updateQuestionFormField('option-A', 'Đáp án A1');
  editorVm.updateQuestionFormField('option-B', 'Đáp án B1');
  editorVm.updateQuestionFormField('option-C', 'Đáp án C1');
  editorVm.updateQuestionFormField('option-D', 'Đáp án D1');
  editorVm.updateQuestionFormField('correctAnswer', 'B');
  editorVm.updateQuestionFormField('explanation', 'Vì B đúng');

  const res1 = editorVm.commitCurrentQuestion({ addNext: true });
  assert.equal(res1.ok, true);
  assert.equal(editorVm.state.exam.singleQuestions.length, 1);
  assert.equal(editorVm.getActiveQuestionDisplayNumber(), 2);

  // Add Question 2
  editorVm.updateQuestionFormField('question', 'Câu hỏi thứ hai?');
  editorVm.updateQuestionFormField('option-A', 'A2');
  editorVm.updateQuestionFormField('option-B', 'B2');
  editorVm.updateQuestionFormField('option-C', 'C2');
  editorVm.updateQuestionFormField('option-D', 'D2');
  editorVm.updateQuestionFormField('correctAnswer', 'D');
  const res2 = editorVm.commitCurrentQuestion({ addNext: false });
  assert.equal(res2.ok, true);
  assert.equal(editorVm.state.exam.singleQuestions.length, 2);

  // Move Question 2 up -> becomes Question 1
  editorVm.moveQuestion(EDITOR_SECTIONS.SINGLE, 1, -1);
  assert.equal(editorVm.state.exam.singleQuestions[0].question, 'Câu hỏi thứ hai?');
  assert.equal(editorVm.state.exam.singleQuestions[0].number, 1);
  assert.equal(editorVm.state.exam.singleQuestions[1].number, 2);

  // Cannot publish with only 2 questions, but CAN save as draft
  const pubFail = await editorVm.saveExam({ publishOverride: true });
  assert.equal(pubFail.ok, false);
  assert.ok(pubFail.errors.length > 0);

  const draftOk = await editorVm.saveExam({ publishOverride: false });
  assert.equal(draftOk.ok, true);
  assert.equal(draftOk.exam.isPublished, false);

  const stored = await repo.getExamById(draftOk.exam.id);
  assert.equal(stored.singleQuestions.length, 2);

  // Delete question 1
  editorVm.deleteQuestion(EDITOR_SECTIONS.SINGLE, 0);
  assert.equal(editorVm.state.exam.singleQuestions.length, 1);
  assert.equal(editorVm.state.exam.singleQuestions[0].question, 'Câu hỏi thứ nhất?');
  assert.equal(editorVm.state.exam.singleQuestions[0].number, 1);
});

test('WorkspaceViewModel supports practice instant-check and timestamp-based timed auto-submit', async () => {
  const repo = createTestRepo();
  let fakeNow = 1_700_000_000_000;
  const exam = normalizeExam(SAMPLE_EXAMS[0]);

  // 1. Practice mode: elapsed time increases, no auto-submit past 40 min, instant answer check allowed
  const practiceVm = new WorkspaceViewModel(repo, () => fakeNow);
  await practiceVm.init({ examId: exam.id, studentName: 'Minh Anh', mode: EXAM_MODES.PRACTICE });
  assert.equal(practiceVm.state.phase, 'active');

  practiceVm.selectAnswer(1, exam.singleQuestions[0].correctAnswer);
  practiceVm.checkQuestionNow(1);
  assert.deepEqual(practiceVm.state.checkedNumbers, [1]);

  // Cannot change answer once checked in practice mode
  practiceVm.selectAnswer(1, 'D');
  assert.equal(practiceVm.state.answers['1'], exam.singleQuestions[0].correctAnswer);

  fakeNow += 45 * 60 * 1000;
  practiceVm.tick(fakeNow);
  assert.equal(practiceVm.state.phase, 'active'); // Not auto-submitted!
  assert.equal(practiceVm.state.elapsedSeconds, 45 * 60);

  await practiceVm.submit();
  assert.equal(practiceVm.state.phase, 'submitted');
  assert.equal(practiceVm.state.submissionResult.correctCount, 1);

  // 2. Timed mode: real timestamp countdown triggers auto-submit when duration elapses
  const timedVm = new WorkspaceViewModel(repo, () => fakeNow);
  await timedVm.init({ examId: exam.id, studentName: 'Gia Bảo', mode: EXAM_MODES.TIMED });
  assert.equal(timedVm.state.remainingSeconds, 40 * 60);

  fakeNow += 40 * 60 * 1000;
  timedVm.tick(fakeNow);
  // Wait microtask for async submit
  await new Promise((r) => setTimeout(r, 10));
  assert.equal(timedVm.state.phase, 'submitted');
  assert.equal(timedVm.state.isAutoTimeUp, true);
});

test('HomeViewModel filters assignments and scopes personal history', async () => {
  const repo = createTestRepo();
  const sample = normalizeExam(SAMPLE_EXAMS[0]);
  await repo.saveSubmission({
    id: 'sub_1',
    examId: sample.id,
    examTitle: sample.title,
    studentName: 'An',
    studentClass: '',
    correctCount: 24,
    totalQuestions: 30,
    score: 24,
    elapsedSeconds: 600,
    answers: {},
    submittedAt: new Date().toISOString()
  });
  repo.setLastStudentName('An');

  const homeVm = new HomeViewModel(repo);
  await homeVm.init();

  assert.equal(homeVm.state.exams.length, 5);
  homeVm.setStatusFilter('done');
  assert.equal(homeVm.getFilteredExams().length, 1);
  homeVm.setStatusFilter('todo');
  assert.equal(homeVm.getFilteredExams().length, 4);

  const stats = homeVm.getDashboardStats();
  assert.equal(stats.bestScore, 24);
  assert.equal(stats.completedExamsCount, 1);
});

test('TeacherScoresViewModel filters and exports UTF-8 BOM CSV', async () => {
  const repo = createTestRepo();
  await repo.saveSubmission({
    id: 'sub_csv',
    examId: 'exam_dgnl_de_11',
    examTitle: 'Đề 11 – Đánh giá năng lực Tiếng Việt',
    studentName: 'Nguyễn Văn A',
    studentClass: '',
    correctCount: 27,
    totalQuestions: 30,
    score: 27,
    elapsedSeconds: 900,
    answers: {},
    submittedAt: '2026-11-21T10:00:00.000Z'
  });

  const scoresVm = new TeacherScoresViewModel(repo);
  await scoresVm.loadScores();
  const csv = scoresVm.buildCsvContent();
  assert.ok(csv.startsWith('\uFEFF'));
  assert.ok(csv.includes('Nguyễn Văn A'));
  assert.ok(csv.includes('27'));
});
