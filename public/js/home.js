import { listExams, listSubmissions } from './storage.js';
import {
  SCORE_SCALE,
  escapeHtml,
  formatDateTime,
  formatDurationText,
  getScoreBadgeClass
} from './utils.js';

const examListContainer = document.getElementById('examListContainer');
const searchExamInput = document.getElementById('searchExamInput');
const recentHistorySection = document.getElementById('recentHistorySection');
const recentHistoryList = document.getElementById('recentHistoryList');

const startModal = document.getElementById('startModal');
const startExamForm = document.getElementById('startExamForm');
const selectedExamIdInput = document.getElementById('selectedExamId');
const modalExamTitle = document.getElementById('modalExamTitle');
const studentNameInput = document.getElementById('studentNameInput');

let allExams = [];

function openStartModal(exam) {
  selectedExamIdInput.value = exam.id;
  modalExamTitle.textContent = `${exam.title} (${exam.durationMinutes || 40} phút • 30 câu)`;
  studentNameInput.value = localStorage.getItem('tv_last_student_name') || '';
  startModal.classList.remove('hidden');
  studentNameInput.focus();
}

function closeStartModal() {
  startModal.classList.add('hidden');
}

function renderExams(exams) {
  if (!exams.length) {
    examListContainer.innerHTML = `
      <div class="card" style="grid-column:1/-1;">
        <div class="card-body" style="text-align:center; padding:40px 20px;">
          <p style="margin:0 0 12px; font-size:16px; color:var(--text-secondary);">
            Chưa có đề thi phù hợp nào được mở.
          </p>
          <a href="/teacher" class="btn btn-primary">Giáo viên tạo đề ngay</a>
        </div>
      </div>
    `;
    return;
  }

  examListContainer.innerHTML = exams
    .map((exam) => {
      const singleCount = exam.singleQuestions?.length || 0;
      const groupCount = (exam.groups || []).reduce((sum, g) => sum + (g.questions?.length || 0), 0);
      const totalCount = singleCount + groupCount;

      return `
        <article class="card exam-card">
          <div class="card-body">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
              <span class="badge badge-green">Đang mở thi</span>
              <span class="badge badge-amber">${Number(exam.durationMinutes) || 40} phút</span>
            </div>
            <h3 class="exam-card-title">${escapeHtml(exam.title)}</h3>
            <p class="exam-card-desc">
              ${escapeHtml(exam.description || 'Đề trắc nghiệm Tiếng Việt 30 câu hỏi 4 phương án A, B, C, D.')}
            </p>
            <div class="exam-meta">
              <span class="badge badge-blue">${totalCount} câu</span>
              <span class="badge">${singleCount} câu đơn (1–20)</span>
              <span class="badge">2 bài đọc hiểu (${groupCount} câu)</span>
            </div>
            <button type="button" class="btn btn-primary" style="width:100%;" data-start-exam="${escapeHtml(exam.id)}">
              Làm bài ngay
            </button>
          </div>
        </article>
      `;
    })
    .join('');

  examListContainer.querySelectorAll('[data-start-exam]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-start-exam');
      const found = allExams.find((e) => e.id === id);
      if (found) openStartModal(found);
    });
  });
}

function renderRecentHistory(submissions) {
  if (!submissions.length) {
    recentHistorySection.classList.add('hidden');
    return;
  }

  recentHistorySection.classList.remove('hidden');

  const grouped = new Map();
  submissions.forEach((sub) => {
    const key = sub.examId || sub.examTitle;
    if (!grouped.has(key)) {
      grouped.set(key, { examTitle: sub.examTitle, items: [] });
    }
    grouped.get(key).items.push(sub);
  });

  recentHistoryList.innerHTML = Array.from(grouped.values())
    .map((group) => {
      const itemsHtml = group.items
        .map((sub) => {
          const scoreClass = getScoreBadgeClass(sub.correctCount, sub.totalQuestions);
          const reviewHref = `/exam?id=${encodeURIComponent(sub.examId)}&review=${encodeURIComponent(sub.id)}`;
          const classTag = sub.studentClass
            ? ` <span style="font-weight:500; color:var(--text-muted);">(${escapeHtml(sub.studentClass)})</span>`
            : '';

          return `
            <div class="history-item">
              <div>
                <div style="font-weight:700; font-size:15px;">
                  ${escapeHtml(sub.studentName)}${classTag}
                </div>
                <div style="font-size:13px; color:var(--text-secondary); margin-top:3px;">
                  Đúng <strong>${sub.correctCount}/${sub.totalQuestions}</strong> câu •
                  Thời gian làm: ${formatDurationText(sub.elapsedSeconds)} •
                  Nộp lúc: <strong>${formatDateTime(sub.submittedAt)}</strong>
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:10px;">
                <span class="badge ${scoreClass}" style="font-size:14px; padding:6px 12px;">${sub.score} / ${SCORE_SCALE} điểm</span>
                <a href="${reviewHref}" class="btn btn-soft btn-sm">Xem lại bài &amp; đáp án</a>
              </div>
            </div>
          `;
        })
        .join('');

      return `
        <div class="card" style="margin-bottom:12px;">
          <div class="card-body" style="padding:16px 18px;">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:10px;">
              <strong style="font-size:15.5px; color:var(--primary-hover);">${escapeHtml(group.examTitle)}</strong>
              <span class="badge badge-blue">${group.items.length} lượt làm</span>
            </div>
            <div class="history-list" style="margin-top:0;">${itemsHtml}</div>
          </div>
        </div>
      `;
    })
    .join('');
}

async function init() {
  try {
    allExams = await listExams({ includeUnpublished: false });
    renderExams(allExams);

    const submissions = await listSubmissions();
    renderRecentHistory(submissions);
  } catch (err) {
    examListContainer.innerHTML = `
      <div class="alert alert-warning" style="grid-column:1/-1;">
        <span>Không thể tải danh sách đề thi: ${escapeHtml(err.message)}</span>
      </div>
    `;
  }
}

searchExamInput.addEventListener('input', () => {
  const q = searchExamInput.value.trim().toLowerCase();
  const filtered = allExams.filter(
    (e) =>
      e.title.toLowerCase().includes(q) ||
      (e.description || '').toLowerCase().includes(q)
  );
  renderExams(filtered);
});

document.getElementById('closeStartModal').addEventListener('click', closeStartModal);
document.getElementById('cancelStartBtn').addEventListener('click', closeStartModal);
startModal.addEventListener('click', (e) => {
  if (e.target === startModal) closeStartModal();
});

startExamForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const examId = selectedExamIdInput.value;
  const studentName = studentNameInput.value.trim();
  if (!examId || !studentName) return;

  localStorage.setItem('tv_last_student_name', studentName);

  const params = new URLSearchParams({
    id: examId,
    name: studentName
  });
  window.location.href = `/exam?${params.toString()}`;
});

init();
