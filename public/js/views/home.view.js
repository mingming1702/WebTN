import {
  escapeHtml,
  formatDateTime,
  formatDurationText
} from '../core/formatters.js';
import { EXAM_MODES } from '../models/exam.model.js';
import { SCORE_SCALE, getScoreBadgeClass } from '../models/grading.model.js';

export class HomeView {
  constructor(vm) {
    this.vm = vm;
    this.els = {
      heroMetrics: document.getElementById('heroMetrics'),
      examListContainer: document.getElementById('examListContainer'),
      searchExamInput: document.getElementById('searchExamInput'),
      statusFilterChips: document.getElementById('statusFilterChips'),
      recentHistorySection: document.getElementById('recentHistorySection'),
      recentHistoryList: document.getElementById('recentHistoryList'),
      startModal: document.getElementById('startModal'),
      modalExamTitle: document.getElementById('modalExamTitle'),
      startExamForm: document.getElementById('startExamForm'),
      studentNameInput: document.getElementById('studentNameInput'),
      closeStartModal: document.getElementById('closeStartModal'),
      cancelStartBtn: document.getElementById('cancelStartBtn')
    };
  }

  mount() {
    this._bindEvents();
    this.unsubscribe = this.vm.subscribe((state) => this.render(state), true);
  }

  _bindEvents() {
    this.els.searchExamInput.addEventListener('input', (e) => {
      this.vm.setSearchQuery(e.target.value);
    });

    this.els.statusFilterChips.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-status-filter]');
      if (!btn) return;
      this.vm.setStatusFilter(btn.getAttribute('data-status-filter'));
    });

    this.els.examListContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-start-exam]');
      if (!btn) return;
      const examId = btn.getAttribute('data-start-exam');
      const mode = btn.getAttribute('data-start-mode') || EXAM_MODES.PRACTICE;
      this.vm.openStartModal(examId, mode);
    });

    this.els.startModal.addEventListener('click', (e) => {
      if (e.target === this.els.startModal) {
        this.vm.closeStartModal();
        return;
      }
      const modeBtn = e.target.closest('[data-start-mode]');
      if (modeBtn) {
        this.vm.setModalMode(modeBtn.getAttribute('data-start-mode'));
      }
    });

    this.els.closeStartModal.addEventListener('click', () => this.vm.closeStartModal());
    this.els.cancelStartBtn.addEventListener('click', () => this.vm.closeStartModal());

    this.els.studentNameInput.addEventListener('input', (e) => {
      this.vm.setModalStudentName(e.target.value);
    });

    this.els.startExamForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nextUrl = this.vm.buildStartUrl();
      if (nextUrl) {
        window.location.href = nextUrl;
      }
    });
  }

  render(state) {
    this._renderHeroMetrics();
    this._renderFilterChips(state);
    this._renderExamGrid(state);
    this._renderHistory(state);
    this._renderStartModal(state.startModal);
  }

  _renderHeroMetrics() {
    const stats = this.vm.getDashboardStats();
    const bestText = stats.bestScore !== null ? `${stats.bestScore}/${SCORE_SCALE}` : '—';
    this.els.heroMetrics.innerHTML = `
      <div class="metric-pill-card">
        <div class="metric-pill-val">${stats.openExamsCount}</div>
        <div class="metric-pill-label">Bài đang mở</div>
      </div>
      <div class="metric-pill-card">
        <div class="metric-pill-val">${stats.completedExamsCount}</div>
        <div class="metric-pill-label">Bài đã làm</div>
      </div>
      <div class="metric-pill-card">
        <div class="metric-pill-val">${bestText}</div>
        <div class="metric-pill-label">Điểm cao nhất</div>
      </div>
    `;
  }

  _renderFilterChips(state) {
    this.els.statusFilterChips.querySelectorAll('[data-status-filter]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-status-filter') === state.statusFilter);
    });
  }

  _renderExamGrid(state) {
    if (state.loading) {
      this.els.examListContainer.innerHTML = `
        <div class="card" style="grid-column:1/-1;">
          <div class="card-body" style="text-align:center; padding:36px; color:var(--text-secondary);">
            Đang tải danh sách bài tập...
          </div>
        </div>
      `;
      return;
    }

    if (state.error) {
      this.els.examListContainer.innerHTML = `
        <div class="alert alert-warning" style="grid-column:1/-1;">
          <span>Không thể tải danh sách bài tập: ${escapeHtml(state.error)}</span>
        </div>
      `;
      return;
    }

    const items = this.vm.getFilteredExams();
    if (!items.length) {
      this.els.examListContainer.innerHTML = `
        <div class="card" style="grid-column:1/-1;">
          <div class="card-body" style="text-align:center; padding:40px 20px;">
            <p style="margin:0 0 12px; font-size:15.5px; color:var(--text-secondary);">
              Không tìm thấy bài tập phù hợp nào đang mở.
            </p>
            <a href="/teacher" class="btn btn-primary">Giáo viên tạo bài tập mới</a>
          </div>
        </div>
      `;
      return;
    }

    this.els.examListContainer.innerHTML = items
      .map(({ exam, totalQuestions, attempt }) => {
        const singleCount = exam.singleQuestions?.length || 0;
        const groupCount = (exam.groups || []).reduce((sum, g) => sum + (g.questions?.length || 0), 0);
        const statusBadge = attempt
          ? `<span class="badge badge-blue">Đã làm ${attempt.count} lượt • Cao nhất ${attempt.bestScore}/${SCORE_SCALE}</span>`
          : '<span class="badge badge-green">Bài tập mới</span>';

        return `
          <article class="card exam-card">
            <div class="card-body">
              <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap;">
                ${statusBadge}
                <span class="badge badge-amber">${Number(exam.durationMinutes) || 40} phút</span>
              </div>
              <h3 class="exam-card-title">${escapeHtml(exam.title)}</h3>
              <p class="exam-card-desc">
                ${escapeHtml(exam.description || 'Bài tập trắc nghiệm Tiếng Việt 30 câu (20 câu đơn + 2 bài đọc hiểu).')}
              </p>
              <div class="exam-meta">
                <span class="badge badge-blue">${totalQuestions} câu</span>
                <span class="badge">${singleCount} câu đơn</span>
                <span class="badge">2 bài đọc hiểu (${groupCount} câu)</span>
              </div>
              <div class="exam-card-actions">
                <button type="button" class="btn btn-primary" data-start-exam="${escapeHtml(exam.id)}" data-start-mode="practice">
                  Làm bài tập
                </button>
                <button type="button" class="btn btn-outline" data-start-exam="${escapeHtml(exam.id)}" data-start-mode="timed" title="Thi thử có đồng hồ đếm ngược">
                  Thi thử
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join('');
  }

  _renderHistory(state) {
    if (state.loading || !state.submissions.length) {
      this.els.recentHistorySection.classList.add('hidden');
      return;
    }

    const groups = this.vm.getGroupedHistory();
    this.els.recentHistorySection.classList.remove('hidden');

    if (!groups.length) {
      this.els.recentHistorySection.classList.add('hidden');
      return;
    }

    this.els.recentHistoryList.innerHTML = groups
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
                    Thời gian: ${formatDurationText(sub.elapsedSeconds)} •
                    Nộp lúc: <strong>${formatDateTime(sub.submittedAt)}</strong>
                  </div>
                </div>
                <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                  <span class="badge ${scoreClass}" style="font-size:13.5px; padding:5px 12px;">${sub.score} / ${SCORE_SCALE} điểm</span>
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

  _renderStartModal(modal) {
    this.els.startModal.classList.toggle('hidden', !modal.open);
    if (!modal.open || !modal.exam) return;

    this.els.modalExamTitle.textContent = `${modal.exam.title} (${modal.exam.durationMinutes || 40} phút • 30 câu)`;
    if (document.activeElement !== this.els.studentNameInput && this.els.studentNameInput.value !== modal.studentName) {
      this.els.studentNameInput.value = modal.studentName;
    }

    this.els.startModal.querySelectorAll('[data-start-mode]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-start-mode') === modal.mode);
    });
  }
}
