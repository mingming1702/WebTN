import {
  clearExamDraft,
  getExamById,
  loadExamDraft,
  saveExamDraft,
  saveSubmission
} from './storage.js';
import {
  OPTION_KEYS,
  escapeHtml,
  flattenExamQuestions,
  formatDurationText,
  formatTimer,
  generateId,
  gradeExam
} from './utils.js';

const params = new URLSearchParams(window.location.search);
const examId = params.get('id') || '';

const topbarExamTitle = document.getElementById('topbarExamTitle');
const topbarStudentInfo = document.getElementById('topbarStudentInfo');
const progressBadge = document.getElementById('progressBadge');
const timerPill = document.getElementById('timerPill');
const submitTopBtn = document.getElementById('submitTopBtn');
const submitSideBtn = document.getElementById('submitSideBtn');

const gateSection = document.getElementById('gateSection');
const gateExamName = document.getElementById('gateExamName');
const gateForm = document.getElementById('gateForm');
const gateStudentName = document.getElementById('gateStudentName');
const gateStudentClass = document.getElementById('gateStudentClass');

const examWorkspace = document.getElementById('examWorkspace');
const questionsColumn = document.getElementById('questionsColumn');
const resultSummaryContainer = document.getElementById('resultSummaryContainer');
const reviewFilterBar = document.getElementById('reviewFilterBar');
const paletteCounter = document.getElementById('paletteCounter');
const paletteSingle = document.getElementById('paletteSingle');
const paletteGroup1 = document.getElementById('paletteGroup1');
const paletteGroup2 = document.getElementById('paletteGroup2');
const paletteSubmitWrap = document.getElementById('paletteSubmitWrap');

const confirmSubmitModal = document.getElementById('confirmSubmitModal');
const confirmSubmitText = document.getElementById('confirmSubmitText');

const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');

let currentExam = null;
let studentName = (params.get('name') || '').trim();
let studentClass = (params.get('class') || '').trim();

let answers = {};
let remainingSeconds = 40 * 60;
let totalDurationSeconds = 40 * 60;
let timerInterval = null;
let isSubmitted = false;
let submissionResult = null;
let activeSectionTab = 'all';
let activeReviewFilter = 'all';

function showError(msg) {
  gateSection.classList.add('hidden');
  examWorkspace.classList.add('hidden');
  errorSection.classList.remove('hidden');
  errorMessage.textContent = msg;
  topbarExamTitle.textContent = 'Không tìm thấy đề thi';
  submitTopBtn.classList.add('hidden');
  timerPill.classList.add('hidden');
}

function getAnsweredCount() {
  return Object.values(answers).filter((val) => OPTION_KEYS.includes(val)).length;
}

function updateProgressUI() {
  const count = getAnsweredCount();
  const total = flattenExamQuestions(currentExam).length || 30;
  progressBadge.textContent = `Đã làm: ${count} / ${total}`;
  paletteCounter.textContent = `${count}/${total}`;
}

function renderPalette() {
  const makeBtn = (num) => {
    const qKey = String(num);
    const chosen = answers[qKey] || '';
    let extraClass = '';

    if (isSubmitted && submissionResult) {
      const detail = submissionResult.details.find((d) => d.number === num);
      extraClass = detail?.isCorrect ? 'review-correct' : 'review-wrong';
    } else if (chosen) {
      extraClass = 'answered';
    }

    return `<button type="button" class="palette-btn ${extraClass}" data-jump-q="${num}">${num}</button>`;
  };

  paletteSingle.innerHTML = Array.from({ length: 20 }, (_, i) => makeBtn(i + 1)).join('');
  paletteGroup1.innerHTML = Array.from({ length: 5 }, (_, i) => makeBtn(21 + i)).join('');
  paletteGroup2.innerHTML = Array.from({ length: 5 }, (_, i) => makeBtn(26 + i)).join('');

  document.querySelectorAll('[data-jump-q]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const num = Number(btn.getAttribute('data-jump-q'));
      if (activeSectionTab !== 'all') {
        activeSectionTab = 'all';
        syncSectionTabButtons();
        renderQuestions();
      }
      if (isSubmitted && activeReviewFilter !== 'all') {
        activeReviewFilter = 'all';
        syncReviewFilterButtons();
        renderQuestions();
      }
      const target = document.getElementById(`question-${num}`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

function shouldShowQuestionInReview(qNumber) {
  if (!isSubmitted || activeReviewFilter === 'all') return true;
  const detail = submissionResult?.details.find((d) => d.number === qNumber);
  if (!detail) return true;
  if (activeReviewFilter === 'correct') return detail.isCorrect;
  if (activeReviewFilter === 'wrong') return !detail.isCorrect;
  return true;
}

function renderQuestionCard(q) {
  const qKey = String(q.number);
  const selected = answers[qKey] || '';
  const detail = isSubmitted ? submissionResult?.details.find((d) => d.number === q.number) : null;

  let cardStatusClass = '';
  let statusBadge = '';

  if (isSubmitted && detail) {
    if (detail.isCorrect) {
      cardStatusClass = 'correct';
      statusBadge = '<span class="badge badge-green">Đúng</span>';
    } else {
      cardStatusClass = 'wrong';
      statusBadge = selected
        ? '<span class="badge badge-red">Sai</span>'
        : '<span class="badge badge-red">Chưa chọn</span>';
    }
  }

  const optionsHtml = OPTION_KEYS.map((key) => {
    const classes = ['option-item'];
    if (isSubmitted) {
      classes.push('locked');
      if (key === q.correctAnswer) {
        classes.push('is-correct');
      } else if (key === selected && selected !== q.correctAnswer) {
        classes.push('is-wrong');
      }
    } else if (key === selected) {
      classes.push('selected');
    }

    return `
      <button
        type="button"
        class="${classes.join(' ')}"
        data-q="${q.number}"
        data-opt="${key}"
        ${isSubmitted ? 'disabled' : ''}
      >
        <span class="option-key">${key}</span>
        <span class="option-label">${escapeHtml(q.options?.[key] || '')}</span>
      </button>
    `;
  }).join('');

  let reviewExtraHtml = '';
  if (isSubmitted) {
    const chosenText = selected ? `Bạn chọn: <strong>${selected}</strong>` : 'Bạn chưa chọn đáp án';
    const explanation = q.explanation
      ? `<div style="margin-top:6px;"><strong>Giải thích:</strong> ${escapeHtml(q.explanation)}</div>`
      : '';
    reviewExtraHtml = `
      <div class="explanation-box">
        <div>${chosenText} • Đáp án đúng: <strong style="color:var(--success);">${q.correctAnswer}</strong></div>
        ${explanation}
      </div>
    `;
  }

  return `
    <article id="question-${q.number}" class="question-card ${cardStatusClass}">
      <div class="question-head">
        <span class="question-num">Câu ${q.number}</span>
        <div class="question-text">${escapeHtml(q.question)}</div>
        ${statusBadge}
      </div>
      <div class="options-list">
        ${optionsHtml}
      </div>
      ${reviewExtraHtml}
    </article>
  `;
}

function renderQuestions() {
  const blocks = [];

  if (activeSectionTab === 'all' || activeSectionTab === 'single') {
    const singleCards = (currentExam.singleQuestions || [])
      .map((q, idx) => ({ ...q, number: idx + 1 }))
      .filter((q) => shouldShowQuestionInReview(q.number))
      .map(renderQuestionCard)
      .join('');

    if (singleCards || !isSubmitted || activeReviewFilter === 'all') {
      blocks.push(`
        <div class="section-banner">
          <h2>Phần I: Câu hỏi đơn (Câu 1 – 20)</h2>
          <p>Mỗi câu có 4 phương án A, B, C, D. Chọn 1 phương án đúng nhất.</p>
        </div>
        ${singleCards || '<div class="card"><div class="card-body">Không có câu nào trong bộ lọc này ở Phần I.</div></div>'}
      `);
    }
  }

  (currentExam.groups || []).forEach((group, gIdx) => {
    const tabKey = `group-${gIdx + 1}`;
    if (activeSectionTab !== 'all' && activeSectionTab !== tabKey) return;

    const startNum = gIdx === 0 ? 21 : 26;
    const endNum = startNum + 4;
    const groupCards = (group.questions || [])
      .map((q, qIdx) => ({ ...q, number: startNum + qIdx }))
      .filter((q) => shouldShowQuestionInReview(q.number))
      .map(renderQuestionCard)
      .join('');

    if (groupCards || !isSubmitted || activeReviewFilter === 'all') {
      blocks.push(`
        <div class="section-banner" style="border-left-color:#d97706; margin-top:22px;">
          <h2>Phần ${gIdx === 0 ? 'II' : 'III'}: Nhóm đọc hiểu ${gIdx + 1} (Câu ${startNum} – ${endNum})</h2>
          <p>Đọc kỹ ngữ liệu bên dưới rồi trả lời 5 câu hỏi liên quan.</p>
        </div>
        <div class="passage-card">
          <span class="passage-label">Ngữ liệu đọc hiểu • Câu ${startNum}–${endNum}</span>
          ${group.passageTitle ? `<h3 class="passage-title">${escapeHtml(group.passageTitle)}</h3>` : ''}
          <div class="passage-content">${escapeHtml(group.passage || '')}</div>
        </div>
        ${groupCards || '<div class="card"><div class="card-body">Không có câu nào trong bộ lọc này ở nhóm này.</div></div>'}
      `);
    }
  });

  questionsColumn.innerHTML = blocks.join('');

  if (!isSubmitted) {
    questionsColumn.querySelectorAll('[data-q][data-opt]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const qNum = btn.getAttribute('data-q');
        const opt = btn.getAttribute('data-opt');
        answers[qNum] = opt;

        saveExamDraft(currentExam.id, {
          studentName,
          studentClass,
          answers,
          remainingSeconds,
          savedAt: Date.now()
        });

        // Update option visuals cleanly without full re-render
        const card = document.getElementById(`question-${qNum}`);
        if (card) {
          card.querySelectorAll('.option-item').forEach((item) => {
            item.classList.toggle('selected', item.getAttribute('data-opt') === opt);
          });
        }
        updateProgressUI();
        renderPalette();
      });
    });
  }
}

function updateTimerDisplay() {
  timerPill.textContent = formatTimer(remainingSeconds);
  timerPill.classList.remove('warning', 'danger');
  if (remainingSeconds <= 60) {
    timerPill.classList.add('danger');
  } else if (remainingSeconds <= 300) {
    timerPill.classList.add('warning');
  }
}

function startTimer() {
  clearInterval(timerInterval);
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    if (isSubmitted) {
      clearInterval(timerInterval);
      return;
    }
    remainingSeconds -= 1;
    updateTimerDisplay();

    if (remainingSeconds % 5 === 0) {
      saveExamDraft(currentExam.id, {
        studentName,
        studentClass,
        answers,
        remainingSeconds,
        savedAt: Date.now()
      });
    }

    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      finalizeSubmission(true);
    }
  }, 1000);
}

async function finalizeSubmission(isAutoTimeUp = false) {
  if (isSubmitted) return;
  isSubmitted = true;
  clearInterval(timerInterval);
  confirmSubmitModal.classList.add('hidden');

  const elapsedSeconds = Math.max(1, totalDurationSeconds - Math.max(0, remainingSeconds));
  submissionResult = gradeExam(currentExam, answers);

  const submissionRecord = {
    id: generateId('sub'),
    examId: currentExam.id,
    examTitle: currentExam.title,
    studentName,
    studentClass,
    correctCount: submissionResult.correctCount,
    totalQuestions: submissionResult.totalQuestions,
    score: submissionResult.score,
    elapsedSeconds,
    answers: { ...answers },
    submittedAt: new Date().toISOString()
  };

  let saveStatusHtml = '<span class="badge badge-green">Đã ghi nhận điểm cho giáo viên</span>';
  try {
    await saveSubmission(submissionRecord);
    clearExamDraft(currentExam.id);
  } catch (err) {
    saveStatusHtml = `<span class="badge badge-amber">Lưu điểm lỗi: ${escapeHtml(err.message)}</span>`;
  }

  submitTopBtn.classList.add('hidden');
  paletteSubmitWrap.classList.add('hidden');
  timerPill.classList.remove('warning', 'danger');
  timerPill.textContent = 'Đã nộp bài';
  reviewFilterBar.classList.remove('hidden');

  resultSummaryContainer.classList.remove('hidden');
  resultSummaryContainer.innerHTML = `
    <div class="result-banner">
      <div>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
          ${isAutoTimeUp ? '<span class="badge badge-amber">Hết giờ – hệ thống tự động nộp bài</span>' : '<span class="badge badge-green">Nộp bài thành công</span>'}
          ${saveStatusHtml}
        </div>
        <h2 style="margin:0 0 6px;">Kết quả của ${escapeHtml(studentName)} (${escapeHtml(studentClass)})</h2>
        <p style="margin:0; color:var(--text-secondary);">
          Số câu trả lời đúng: <strong>${submissionResult.correctCount} / ${submissionResult.totalQuestions} câu</strong> •
          Thời gian làm bài: <strong>${formatDurationText(elapsedSeconds)}</strong>
        </p>
        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:14px;">
          <a href="/" class="btn btn-outline btn-sm">Làm đề khác</a>
          <button id="retakeExamBtn" type="button" class="btn btn-soft btn-sm">Làm lại đề này</button>
        </div>
      </div>
      <div class="score-circle">
        <div class="score-val">${submissionResult.score}</div>
        <div class="score-sub">Điểm / 10</div>
      </div>
    </div>
  `;

  document.getElementById('retakeExamBtn').addEventListener('click', () => {
    clearExamDraft(currentExam.id);
    window.location.reload();
  });

  renderPalette();
  renderQuestions();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openSubmitConfirm() {
  if (isSubmitted) return;
  const total = flattenExamQuestions(currentExam).length || 30;
  const answered = getAnsweredCount();
  const unanswered = total - answered;

  confirmSubmitText.innerHTML =
    unanswered > 0
      ? `Bạn đã trả lời <strong>${answered}/${total}</strong> câu. Vẫn còn <strong>${unanswered}</strong> câu chưa chọn đáp án. Bạn có chắc chắn muốn nộp bài ngay không?`
      : `Bạn đã trả lời đầy đủ <strong>${answered}/${total}</strong> câu hỏi. Bấm <strong>Đồng ý nộp bài</strong> để xem điểm và đáp án đúng.`;

  confirmSubmitModal.classList.remove('hidden');
}

function syncSectionTabButtons() {
  document.querySelectorAll('[data-section-tab]').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-section-tab') === activeSectionTab);
  });
}

function syncReviewFilterButtons() {
  document.querySelectorAll('[data-review-filter]').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-review-filter') === activeReviewFilter);
  });
}

function beginExamSession() {
  gateSection.classList.add('hidden');
  examWorkspace.classList.remove('hidden');
  topbarStudentInfo.textContent = `Thí sinh: ${studentName} • Lớp: ${studentClass}`;

  totalDurationSeconds = (Number(currentExam.durationMinutes) || 40) * 60;
  const draft = loadExamDraft(currentExam.id);
  if (
    draft &&
    draft.studentName === studentName &&
    draft.studentClass === studentClass &&
    typeof draft.remainingSeconds === 'number' &&
    draft.remainingSeconds > 0
  ) {
    answers = draft.answers || {};
    remainingSeconds = draft.remainingSeconds;
  } else {
    answers = {};
    remainingSeconds = totalDurationSeconds;
  }

  updateProgressUI();
  renderPalette();
  renderQuestions();
  startTimer();
}

async function init() {
  if (!examId) {
    showError('Đường dẫn chưa có mã đề thi. Vui lòng chọn đề từ trang chủ.');
    return;
  }

  try {
    currentExam = await getExamById(examId);
    if (!currentExam) {
      showError('Đề thi không tồn tại hoặc đã bị xóa.');
      return;
    }

    topbarExamTitle.textContent = currentExam.title;
    gateExamName.textContent = `${currentExam.title} • ${Number(currentExam.durationMinutes) || 40} phút • 30 câu`;

    if (studentName && studentClass) {
      beginExamSession();
    } else {
      gateStudentName.value = localStorage.getItem('tv_last_student_name') || '';
      gateStudentClass.value = localStorage.getItem('tv_last_student_class') || '';
      gateSection.classList.remove('hidden');
    }
  } catch (err) {
    showError(`Không thể tải đề thi: ${err.message}`);
  }
}

gateForm.addEventListener('submit', (e) => {
  e.preventDefault();
  studentName = gateStudentName.value.trim();
  studentClass = gateStudentClass.value.trim();
  if (!studentName || !studentClass) return;

  localStorage.setItem('tv_last_student_name', studentName);
  localStorage.setItem('tv_last_student_class', studentClass);
  beginExamSession();
});

document.querySelectorAll('[data-section-tab]').forEach((btn) => {
  btn.addEventListener('click', () => {
    activeSectionTab = btn.getAttribute('data-section-tab');
    syncSectionTabButtons();
    renderQuestions();
  });
});

document.querySelectorAll('[data-review-filter]').forEach((btn) => {
  btn.addEventListener('click', () => {
    activeReviewFilter = btn.getAttribute('data-review-filter');
    syncReviewFilterButtons();
    renderQuestions();
  });
});

submitTopBtn.addEventListener('click', openSubmitConfirm);
submitSideBtn.addEventListener('click', openSubmitConfirm);
document.getElementById('cancelSubmitModal').addEventListener('click', () => {
  confirmSubmitModal.classList.add('hidden');
});
document.getElementById('continueExamBtn').addEventListener('click', () => {
  confirmSubmitModal.classList.add('hidden');
});
document.getElementById('confirmSubmitBtn').addEventListener('click', () => finalizeSubmission(false));

init();
