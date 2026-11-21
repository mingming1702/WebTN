import { flattenExamQuestions } from './exam.model.js';

export const SCORE_SCALE = 40;

export function getScoreBadgeClass(correctCount, totalQuestions = 30) {
  const ratio = Number(correctCount) / (Number(totalQuestions) || 30);
  if (ratio >= 0.8) return 'badge-green';
  if (ratio >= 0.5) return 'badge-blue';
  return 'badge-red';
}

export function gradeExam(exam, answersMap) {
  const flatQuestions = flattenExamQuestions(exam);
  let correctCount = 0;

  const sectionBreakdown = {
    single: { correct: 0, total: 0 },
    group1: { correct: 0, total: 0 },
    group2: { correct: 0, total: 0 }
  };

  const details = flatQuestions.map((q) => {
    const selected = answersMap?.[String(q.number)] || '';
    const isCorrect = selected === q.correctAnswer;
    if (isCorrect) correctCount += 1;

    const bucketKey = q.section === 'group-1' ? 'group1' : q.section === 'group-2' ? 'group2' : 'single';
    sectionBreakdown[bucketKey].total += 1;
    if (isCorrect) sectionBreakdown[bucketKey].correct += 1;

    return {
      number: q.number,
      selected,
      correctAnswer: q.correctAnswer,
      isCorrect
    };
  });

  const totalQuestions = flatQuestions.length || 30;
  // Thang điểm 40: mỗi câu đúng được 1 điểm
  const score = correctCount;

  return {
    correctCount,
    totalQuestions,
    score,
    scoreScale: SCORE_SCALE,
    sectionBreakdown,
    details
  };
}

export function computeSubmissionStats(submissions = []) {
  const totalCount = submissions.length;
  if (!totalCount) {
    return { totalCount: 0, avgScore: '0', maxScore: 0, highRate: 0 };
  }

  const totalScore = submissions.reduce((sum, s) => sum + Number(s.score || 0), 0);
  const avgScore = (totalScore / totalCount).toFixed(2);
  const maxScore = Math.max(...submissions.map((s) => Number(s.score || 0)));
  const highCount = submissions.filter(
    (s) => Number(s.correctCount || 0) / (Number(s.totalQuestions) || 30) >= 0.8
  ).length;
  const highRate = Math.round((highCount / totalCount) * 100);

  return { totalCount, avgScore, maxScore, highRate };
}

export function computeTopWrongQuestions(submissions = [], exams = [], limit = 4) {
  if (!submissions.length || !exams.length) return [];

  const examMap = new Map(exams.map((e) => [e.id, e]));
  const statMap = new Map();

  submissions.forEach((sub) => {
    const exam = examMap.get(sub.examId);
    if (!exam) return;
    const flat = flattenExamQuestions(exam);
    flat.forEach((q) => {
      const key = `${exam.id}::${q.number}`;
      if (!statMap.has(key)) {
        statMap.set(key, {
          examId: exam.id,
          examTitle: exam.title,
          number: q.number,
          question: q.question,
          total: 0,
          wrong: 0
        });
      }
      const entry = statMap.get(key);
      entry.total += 1;
      const chosen = sub.answers?.[String(q.number)] || '';
      if (chosen !== q.correctAnswer) {
        entry.wrong += 1;
      }
    });
  });

  return Array.from(statMap.values())
    .filter((item) => item.wrong > 0)
    .map((item) => ({
      ...item,
      rate: Math.round((item.wrong / item.total) * 100)
    }))
    .sort((a, b) => b.wrong / b.total - a.wrong / a.total || b.wrong - a.wrong)
    .slice(0, limit);
}
