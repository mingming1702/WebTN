export const OPTION_KEYS = ['A', 'B', 'C', 'D'];
export const SCORE_SCALE = 30;

export function getScoreBadgeClass(correctCount, totalQuestions = 30) {
  const ratio = Number(correctCount) / (Number(totalQuestions) || 30);
  if (ratio >= 0.8) return 'badge-green';
  if (ratio >= 0.5) return 'badge-blue';
  return 'badge-red';
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generateId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function formatTimer(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatDurationText(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  if (mins === 0) return `${secs} giây`;
  if (secs === 0) return `${mins} phút`;
  return `${mins} phút ${secs} giây`;
}

export function formatDateTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export function createEmptyQuestion(number) {
  return {
    number,
    question: '',
    options: { A: '', B: '', C: '', D: '' },
    correctAnswer: 'A',
    explanation: ''
  };
}

export function createEmptyExamTemplate() {
  const singleQuestions = Array.from({ length: 20 }, (_, i) => createEmptyQuestion(i + 1));
  const groups = [
    {
      id: 'group_1',
      title: 'Ngữ liệu đọc hiểu 1 (Câu 21 - 25)',
      passageTitle: '',
      passage: '',
      questions: Array.from({ length: 5 }, (_, i) => createEmptyQuestion(21 + i))
    },
    {
      id: 'group_2',
      title: 'Ngữ liệu đọc hiểu 2 (Câu 26 - 30)',
      passageTitle: '',
      passage: '',
      questions: Array.from({ length: 5 }, (_, i) => createEmptyQuestion(26 + i))
    }
  ];

  return {
    id: generateId('exam'),
    title: '',
    description: '',
    durationMinutes: 40,
    isPublished: true,
    singleQuestions,
    groups,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function flattenExamQuestions(exam) {
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

export function validateExam(exam) {
  const errors = [];
  if (!exam.title || !exam.title.trim()) {
    errors.push('Vui lòng nhập tên đề thi.');
  }

  const duration = Number(exam.durationMinutes);
  if (!Number.isFinite(duration) || duration < 1 || duration > 180) {
    errors.push('Thời gian làm bài phải từ 1 đến 180 phút.');
  }

  if (!Array.isArray(exam.singleQuestions) || exam.singleQuestions.length !== 20) {
    errors.push('Phần câu hỏi đơn phải có đủ 20 câu (từ câu 1 đến câu 20).');
  } else {
    exam.singleQuestions.forEach((q, idx) => {
      const num = idx + 1;
      if (!q.question || !q.question.trim()) {
        errors.push(`Câu ${num} chưa có nội dung câu hỏi.`);
      }
      OPTION_KEYS.forEach((k) => {
        if (!q.options?.[k] || !String(q.options[k]).trim()) {
          errors.push(`Câu ${num} thiếu phương án ${k}.`);
        }
      });
      if (!OPTION_KEYS.includes(q.correctAnswer)) {
        errors.push(`Câu ${num} chưa chọn đáp án đúng.`);
      }
    });
  }

  if (!Array.isArray(exam.groups) || exam.groups.length !== 2) {
    errors.push('Đề thi phải có đủ 2 nhóm đọc hiểu (Câu 21-25 và Câu 26-30).');
  } else {
    exam.groups.forEach((group, gIdx) => {
      const label = gIdx === 0 ? 'Nhóm 1 (Câu 21-25)' : 'Nhóm 2 (Câu 26-30)';
      const startNum = gIdx === 0 ? 21 : 26;
      if (!group.passage || !group.passage.trim()) {
        errors.push(`${label} chưa có đoạn văn bản / ngữ liệu.`);
      }
      if (!Array.isArray(group.questions) || group.questions.length !== 5) {
        errors.push(`${label} phải có đủ 5 câu hỏi.`);
      } else {
        group.questions.forEach((q, qIdx) => {
          const num = startNum + qIdx;
          if (!q.question || !q.question.trim()) {
            errors.push(`Câu ${num} chưa có nội dung câu hỏi.`);
          }
          OPTION_KEYS.forEach((k) => {
            if (!q.options?.[k] || !String(q.options[k]).trim()) {
              errors.push(`Câu ${num} thiếu phương án ${k}.`);
            }
          });
          if (!OPTION_KEYS.includes(q.correctAnswer)) {
            errors.push(`Câu ${num} chưa chọn đáp án đúng.`);
          }
        });
      }
    });
  }

  return errors;
}

export function gradeExam(exam, answersMap) {
  const flatQuestions = flattenExamQuestions(exam);
  let correctCount = 0;

  const details = flatQuestions.map((q) => {
    const selected = answersMap?.[String(q.number)] || '';
    const isCorrect = selected === q.correctAnswer;
    if (isCorrect) correctCount += 1;
    return {
      number: q.number,
      selected,
      correctAnswer: q.correctAnswer,
      isCorrect
    };
  });

  const totalQuestions = flatQuestions.length || 30;
  // Thang điểm 30: mỗi câu đúng được 1 điểm
  const score = correctCount;

  return {
    correctCount,
    totalQuestions,
    score,
    scoreScale: SCORE_SCALE,
    details
  };
}
