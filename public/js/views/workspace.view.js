import {
  escapeHtml,
  formatDateTime,
  formatDurationText,
  formatPassageHtml,
  formatQuestionHtml,
  formatTimer
} from '../core/formatters.js';
import { EXAM_MODES, OPTION_KEYS } from '../models/exam.model.js';
import { SCORE_SCALE } from '../models/grading.model.js';

export class WorkspaceView {
  constructor(vm) {
    this.vm = vm;
    this.els = {
      topbarExamTitle: document.getElementById('topbarExamTitle'),
      modeBadge: document.getElementById('modeBadge'),
      topbarStudentInfo: document.getElementById('topbarStudentInfo'),
      progressBadge: document.getElementById('progressBadge'),
      timerPill: document.getElementById('timerPill'),
      submitTopBtn: document.getElementById('submitTopBtn'),
      workspaceProgressFill: document.getElementById('workspaceProgressFill'),

      gateSection: document.getElementById('gateSection'),
      gateExamName: document.getElementById('gateExamName'),
      gateForm: document.getElementById('gateForm'),
      gateStudentName: document.getElementById('gateStudentName'),

      examWorkspace: document.getElementById('examWorkspace'),
      resultSummaryContainer: document.getElementById('resultSummaryContainer'),
      sectionTabs: document.getElementById('sectionTabs'),
      reviewFilterBar: document.getElementById('reviewFilterBar'),
      questionsColumn: document.getElementById('questionsColumn'),
      paletteCounter: document.getElementById('paletteCounter'),
      paletteSingle: document.getElementById('paletteSingle'),
      paletteGroup1: document.getElementById('paletteGroup1'),
      paletteGroup2: document.getElementById('paletteGroup2'),
      paletteSubmitWrap: document.getElementById('paletteSubmitWrap'),
      submitSideBtn: document.getElementById('submitSideBtn'),

      errorSection: document.getElementById('errorSection'),
      errorMessage: document.getElementById('errorMessage'),

      confirmSubmitModal: document.getElementById('confirmSubmitModal'),
      confirmSubmitText: document.getElementById('confirmSubmitText'),
      cancelSubmitModal: document.getElementById('cancelSubmitModal'),
      continueExamBtn: document.getElementById('continueExamBtn'),
      confirmSubmitBtn: document.getElementById('confirmSubmitBtn')
    };

    this._lastStructuralKey = '';
  }

  mount() {
    this._bindEvents();
    this.unsubscribe = this.vm.subscribe((state, prev) => this.render(state, prev), true);
  }

  _bindEvents() {
    this.els.gateForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const activeModeBtn = this.els.gateForm.querySelector('[data-gate-mode].active');
      const mode = activeModeBtn?.getAttribute('data-gate-mode') || EXAM_MODES.PRACTICE;
      this.vm.startFromGate({
        studentName: this.els.gateStudentName.value,
        mode
      });
    });

    this.els.gateForm.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-gate-mode]');
      if (!btn) return;
      const mode = btn.getAttribute('data-gate-mode');
      this.els.gateForm.querySelectorAll('[data-gate-mode]').forEach((el) => {
        el.classList.toggle('active', el.getAttribute('data-gate-mode') === mode);
      });
    });

    this.els.sectionTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-section-tab]');
      if (!btn) return;
      this.vm.setSectionTab(btn.getAttribute('data-section-tab'));
    });

    this.els.reviewFilterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-review-filter]');
      if (!btn) return;
      this.vm.setReviewFilter(btn.getAttribute('data-review-filter'));
    });

    this.els.questionsColumn.addEventListener('click', (e) => {
      const optBtn = e.target.closest('[data-q][data-opt]');
      if (optBtn) {
        this.vm.selectAnswer(optBtn.getAttribute('data-q'), optBtn.getAttribute('data-opt'));
        return;
      }

      const checkBtn = e.target.closest('[data-check-q]');
      if (checkBtn) {
        this.vm.checkQuestionNow(checkBtn.getAttribute('data-check-q'));
        return;
      }

      const flagBtn = e.target.closest('[data-flag-q]');
      if (flagBtn) {
        this.vm.toggleFlag(flagBtn.getAttribute('data-flag-q'));
        return;
      }

      const fontBtn = e.target.closest('[data-font-delta]');
      if (fontBtn) {
        this.vm.adjustPassageFontSize(Number(fontBtn.getAttribute('data-font-delta')));
      }
    });

    document.querySelector('.palette-card').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-jump-q]');
      if (!btn) return;
      const num = this.vm.jumpToQuestion(btn.getAttribute('data-jump-q'));
      requestAnimationFrame(() => {
        const target = document.getElementById(`question-${num}`);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    this.els.submitTopBtn.addEventListener('click', () => this.vm.openConfirmModal());
    this.els.submitSideBtn.addEventListener('click', () => this.vm.openConfirmModal());
    this.els.cancelSubmitModal.addEventListener('click', () => this.vm.closeConfirmModal());
    this.els.continueExamBtn.addEventListener('click', () => this.vm.closeConfirmModal());
    this.els.confirmSubmitBtn.addEventListener('click', () => this.vm.submit({ isAutoTimeUp: false }));

    this.els.resultSummaryContainer.addEventListener('click', (e) => {
      if (e.target.closest('#retakeExamBtn')) {
        window.location.href = this.vm.buildRetakeUrl();
      }
    });
  }

  render(state) {
    this._renderTimerAndProgress(state);

    // Avoid rebuilding entire question list every second during timer ticks
    const structuralKey = JSON.stringify([
      state.phase,
      state.exam?.id,
      state.mode,
      state.answers,
      state.flaggedNumbers,
      state.checkedNumbers,
      state.activeSectionTab,
      state.activeReviewFilter,
      state.passageFontSize,
      state.confirmModalOpen
    ]);

    if (structuralKey !== this._lastStructuralKey) {
      this._lastStructuralKey = structuralKey;
      this._renderPhase(state);
    }
  }

  _renderTimerAndProgress(state) {
    if (state.phase === 'error') {
      this.els.timerPill.classList.add('hidden');
      this.els.submitTopBtn.classList.add('hidden');
      this.els.progressBadge.classList.add('hidden');
      this.els.workspaceProgressFill.style.width = '0%';
      return;
    }

    const total = this.vm.getTotalQuestions();
    const answered = this.vm.getAnsweredCount();
    const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

    this.els.progressBadge.classList.remove('hidden');
    this.els.progressBadge.textContent = `Đã làm: ${answered} / ${total}`;
    this.els.paletteCounter.textContent = `${answered}/${total}`;
    this.els.workspaceProgressFill.style.width = `${pct}%`;

    this.els.timerPill.classList.remove('hidden', 'warning', 'danger', 'practice');
    if (state.phase === 'submitted') {
      this.els.timerPill.textContent = 'Đã nộp bài';
      return;
    }

    if (state.mode === EXAM_MODES.PRACTICE) {
      this.els.timerPill.classList.add('practice');
      this.els.timerPill.textContent = `Thời gian: ${formatTimer(state.elapsedSeconds)}`;
    } else {
      this.els.timerPill.textContent = formatTimer(state.remainingSeconds);
      if (state.remainingSeconds <= 60) {
        this.els.timerPill.classList.add('danger');
      } else if (state.remainingSeconds <= 300) {
        this.els.timerPill.classList.add('warning');
      }
    }
  }

  _renderPhase(state) {
    this.els.errorSection.classList.toggle('hidden', state.phase !== 'error');
    this.els.gateSection.classList.toggle('hidden', state.phase !== 'gate');
    this.els.examWorkspace.classList.toggle('hidden', state.phase !== 'active' && state.phase !== 'submitted');

    if (state.phase === 'error') {
      this.els.topbarExamTitle.textContent = 'Không tìm thấy bài tập';
      this.els.modeBadge.classList.add('hidden');
      this.els.errorMessage.textContent = state.errorMessage;
      return;
    }

    if (!state.exam) return;
    this.els.topbarExamTitle.textContent = state.exam.title;

    if (state.phase === 'gate') {
      this.els.submitTopBtn.classList.add('hidden');
      this.els.modeBadge.classList.add('hidden');
      this.els.gateExamName.textContent = `${state.exam.title} • ${Number(state.exam.durationMinutes) || 40} phút • ${this.vm.getTotalQuestions()} câu`;
      if (!this.els.gateStudentName.value && state.gateDefaultName) {
        this.els.gateStudentName.value = state.gateDefaultName;
      }
      this.els.gateForm.querySelectorAll('[data-gate-mode]').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-gate-mode') === state.gateDefaultMode);
      });
      return;
    }

    const isSubmitted = state.phase === 'submitted';
    this.els.submitTopBtn.classList.toggle('hidden', isSubmitted);
    this.els.paletteSubmitWrap.classList.toggle('hidden', isSubmitted);
    this.els.reviewFilterBar.classList.toggle('hidden', !isSubmitted);

    this.els.modeBadge.classList.remove('hidden', 'badge-blue', 'badge-amber', 'badge-green');
    if (state.isReviewOnly) {
      this.els.modeBadge.classList.add('badge-blue');
      this.els.modeBadge.textContent = 'Xem lại bài';
    } else if (state.mode === EXAM_MODES.TIMED) {
      this.els.modeBadge.classList.add('badge-amber');
      this.els.modeBadge.textContent = 'Thi thử bấm giờ';
    } else {
      this.els.modeBadge.classList.add('badge-green');
      this.els.modeBadge.textContent = 'Ôn luyện';
    }

    this.els.topbarStudentInfo.textContent = state.studentClass
      ? `${state.isReviewOnly ? 'Xem lại' : 'Học sinh'}: ${state.studentName} • Lớp: ${state.studentClass}`
      : `${state.isReviewOnly ? 'Xem lại' : 'Học sinh'}: ${state.studentName}`;

    this._syncTabButtons(state);
    this._renderResultBanner(state);
    this._renderPalette(state);
    this._renderQuestions(state);
    this._renderConfirmModal(state);
  }

  _syncTabButtons(state) {
    this.els.sectionTabs.querySelectorAll('[data-section-tab]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-section-tab') === state.activeSectionTab);
    });
    this.els.reviewFilterBar.querySelectorAll('[data-review-filter]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-review-filter') === state.activeReviewFilter);
    });
  }

  _renderResultBanner(state) {
    if (state.phase !== 'submitted' || !state.submissionResult) {
      this.els.resultSummaryContainer.classList.add('hidden');
      return;
    }

    const res = state.submissionResult;
    const sub = state.submissionRecord;
    const bd = res.sectionBreakdown;
    const statusBadge = state.saveStatus.ok
      ? `<span class="badge badge-green">${escapeHtml(state.saveStatus.message)}</span>`
      : `<span class="badge badge-amber">${escapeHtml(state.saveStatus.message)}</span>`;

    this.els.resultSummaryContainer.classList.remove('hidden');
    this.els.resultSummaryContainer.innerHTML = `
      <div class="result-banner">
        <div>
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
            ${state.isAutoTimeUp ? '<span class="badge badge-amber">Hết giờ – hệ thống tự nộp</span>' : '<span class="badge badge-green">Đã hoàn thành bài làm</span>'}
            ${statusBadge}
          </div>
          <h2 style="margin:0 0 6px;">Kết quả của ${escapeHtml(state.studentName)}${state.studentClass ? ` (${escapeHtml(state.studentClass)})` : ''}</h2>
          <p style="margin:0; color:var(--text-secondary);">
            Số câu trả lời đúng: <strong>${res.correctCount} / ${res.totalQuestions} câu</strong> •
            Thời gian làm: <strong>${formatDurationText(state.elapsedSeconds)}</strong>
            ${sub?.submittedAt ? ` • Nộp lúc: <strong>${escapeHtml(formatDateTime(sub.submittedAt))}</strong>` : ''}
          </p>
          <div class="breakdown-pills">
            <span class="badge">Phần I (Câu đơn): ${bd.single.correct}/${bd.single.total}</span>
            <span class="badge">Phần II (Đọc hiểu 1): ${bd.group1.correct}/${bd.group1.total}</span>
            <span class="badge">Phần III (Đọc hiểu 2): ${bd.group2.correct}/${bd.group2.total}</span>
          </div>
          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:14px;">
            <a href="/" class="btn btn-outline btn-sm">← Quay về trang chủ</a>
            <button id="retakeExamBtn" type="button" class="btn btn-soft btn-sm">Làm lại bài này</button>
          </div>
        </div>
        <div class="score-circle">
          <div class="score-val">${res.score}</div>
          <div class="score-sub">Điểm / ${SCORE_SCALE}</div>
        </div>
      </div>
    `;
  }

  _renderPalette(state) {
    const isSubmitted = state.phase === 'submitted';
    const makeBtn = (num) => {
      const chosen = state.answers[String(num)] || '';
      const classes = ['palette-btn'];
      const isChecked = state.checkedNumbers.includes(num);

      if (isSubmitted && state.submissionResult) {
        const detail = state.submissionResult.details.find((d) => d.number === num);
        classes.push(detail?.isCorrect ? 'review-correct' : 'review-wrong');
      } else if (isChecked) {
        const qObj = this._findQuestionByNumber(state.exam, num);
        classes.push(qObj && chosen === qObj.correctAnswer ? 'review-correct' : 'review-wrong');
      } else {
        if (chosen) classes.push('answered');
        if (state.flaggedNumbers.includes(num)) classes.push('flagged');
      }

      return `<button type="button" class="${classes.join(' ')}" data-jump-q="${num}">${num}</button>`;
    };

    const singleCount = state.exam.singleQuestions?.length || 0;
    const g1Count = state.exam.groups?.[0]?.questions?.length || 0;
    const g2Count = state.exam.groups?.[1]?.questions?.length || 0;

    this.els.paletteSingle.innerHTML = Array.from({ length: singleCount }, (_, i) => makeBtn(i + 1)).join('');
    this.els.paletteGroup1.innerHTML = Array.from({ length: g1Count }, (_, i) => makeBtn(21 + i)).join('');
    this.els.paletteGroup2.innerHTML = Array.from({ length: g2Count }, (_, i) => makeBtn(26 + i)).join('');
  }

  _findQuestionByNumber(exam, num) {
    if (num <= 20) return exam.singleQuestions?.[num - 1] || null;
    if (num <= 25) return exam.groups?.[0]?.questions?.[num - 21] || null;
    return exam.groups?.[1]?.questions?.[num - 26] || null;
  }

  _shouldShowInReview(state, qNumber) {
    if (state.phase !== 'submitted' || state.activeReviewFilter === 'all') return true;
    const detail = state.submissionResult?.details.find((d) => d.number === qNumber);
    if (!detail) return true;
    return state.activeReviewFilter === 'correct' ? detail.isCorrect : !detail.isCorrect;
  }

  _renderQuestionCard(state, q) {
    const qKey = String(q.number);
    const selected = state.answers[qKey] || '';
    const isSubmitted = state.phase === 'submitted';
    const isInstantChecked = !isSubmitted && state.checkedNumbers.includes(q.number);
    const showAnswer = isSubmitted || isInstantChecked;
    const isFlagged = state.flaggedNumbers.includes(q.number);
    const isCorrect = selected === q.correctAnswer;

    let cardStatusClass = '';
    let rightActionHtml = '';

    if (showAnswer) {
      if (isCorrect) {
        cardStatusClass = 'correct';
        rightActionHtml = '<span class="badge badge-green">Đúng</span>';
      } else {
        cardStatusClass = 'wrong';
        rightActionHtml = selected
          ? '<span class="badge badge-red">Sai</span>'
          : '<span class="badge badge-red">Chưa chọn</span>';
      }
    } else {
      rightActionHtml = `
        <button type="button" class="flag-btn ${isFlagged ? 'flagged' : ''}" data-flag-q="${q.number}">
          ${isFlagged ? '★ Đã đánh dấu' : '☆ Xem lại'}
        </button>
      `;
    }

    const optionsHtml = OPTION_KEYS.map((key) => {
      const classes = ['option-item'];
      if (showAnswer) {
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
          ${showAnswer ? 'disabled' : ''}
        >
          <span class="option-key">${key}</span>
          <span class="option-label">${escapeHtml(q.options?.[key] || '')}</span>
        </button>
      `;
    }).join('');

    let extraHtml = '';
    if (showAnswer) {
      const chosenText = selected ? `Bạn chọn: <strong>${selected}</strong>` : 'Bạn chưa chọn đáp án';
      const explanation = q.explanation
        ? `<div style="margin-top:6px;"><strong>Giải thích:</strong> ${escapeHtml(q.explanation)}</div>`
        : '';
      extraHtml = `
        <div class="explanation-box">
          <div>${chosenText} • Đáp án đúng: <strong style="color:var(--success);">${q.correctAnswer}</strong></div>
          ${explanation}
        </div>
      `;
    } else if (state.mode === EXAM_MODES.PRACTICE && selected) {
      extraHtml = `
        <div class="practice-check-row">
          <button type="button" class="btn btn-soft btn-sm" data-check-q="${q.number}">
            Kiểm tra đáp án câu ${q.number}
          </button>
        </div>
      `;
    }

    return `
      <article id="question-${q.number}" class="question-card ${cardStatusClass}">
        <div class="question-head">
          <span class="question-num">Câu ${q.number}</span>
          <div class="question-text">${formatQuestionHtml(q.question)}</div>
          ${rightActionHtml}
        </div>
        <div class="options-list">
          ${optionsHtml}
        </div>
        ${extraHtml}
      </article>
    `;
  }

  _renderQuestions(state) {
    const blocks = [];
    const isSubmitted = state.phase === 'submitted';

    if (state.activeSectionTab === 'all' || state.activeSectionTab === 'single') {
      const singleCards = (state.exam.singleQuestions || [])
        .map((q, idx) => ({ ...q, number: idx + 1 }))
        .filter((q) => this._shouldShowInReview(state, q.number))
        .map((q) => this._renderQuestionCard(state, q))
        .join('');

      if (singleCards || !isSubmitted || state.activeReviewFilter === 'all') {
        blocks.push(`
          <div class="section-banner">
            <h2>Phần I: Câu hỏi đơn (Câu 1 – ${state.exam.singleQuestions?.length || 20})</h2>
            <p>Mỗi câu có 4 phương án A, B, C, D. Chọn 1 phương án đúng nhất.</p>
          </div>
          ${singleCards || '<div class="card"><div class="card-body">Không có câu nào khớp bộ lọc ở Phần I.</div></div>'}
        `);
      }
    }

    (state.exam.groups || []).forEach((group, gIdx) => {
      const tabKey = `group-${gIdx + 1}`;
      if (state.activeSectionTab !== 'all' && state.activeSectionTab !== tabKey) return;

      const startNum = gIdx === 0 ? 21 : 26;
      const endNum = startNum + Math.max(0, (group.questions?.length || 5) - 1);
      const groupCards = (group.questions || [])
        .map((q, qIdx) => ({ ...q, number: startNum + qIdx }))
        .filter((q) => this._shouldShowInReview(state, q.number))
        .map((q) => this._renderQuestionCard(state, q))
        .join('');

      if (groupCards || !isSubmitted || state.activeReviewFilter === 'all') {
        blocks.push(`
          <div class="section-banner reading" style="margin-top:20px;">
            <h2>Phần ${gIdx === 0 ? 'II' : 'III'}: Đọc hiểu ${gIdx + 1} (Câu ${startNum} – ${endNum})</h2>
            <p>Đọc kỹ ngữ liệu bên trái (hoặc phía trên trên điện thoại) rồi trả lời các câu hỏi liên quan.</p>
          </div>
          <div class="split-group-layout">
            <div class="passage-card">
              <div class="passage-header-bar">
                <span class="passage-label">Ngữ liệu đọc hiểu • Câu ${startNum}–${endNum}</span>
                <div class="font-size-controls" aria-label="Cỡ chữ ngữ liệu">
                  <button type="button" class="btn btn-outline btn-xs" data-font-delta="-1" title="Thu nhỏ chữ">A-</button>
                  <button type="button" class="btn btn-outline btn-xs" data-font-delta="1" title="Phóng to chữ">A+</button>
                </div>
              </div>
              ${group.passageTitle ? `<h3 class="passage-title">${escapeHtml(group.passageTitle)}</h3>` : ''}
              <div class="passage-content" style="--passage-font-size: ${state.passageFontSize}px;">
                ${formatPassageHtml(group.passage || '')}
              </div>
            </div>
            <div>
              ${groupCards || '<div class="card"><div class="card-body">Không có câu nào khớp bộ lọc ở nhóm này.</div></div>'}
            </div>
          </div>
        `);
      }
    });

    this.els.questionsColumn.innerHTML = blocks.join('');
  }

  _renderConfirmModal(state) {
    this.els.confirmSubmitModal.classList.toggle('hidden', !state.confirmModalOpen);
    if (!state.confirmModalOpen) return;

    const total = this.vm.getTotalQuestions();
    const answered = this.vm.getAnsweredCount();
    const unanswered = total - answered;
    const flaggedCount = state.flaggedNumbers.length;

    const parts = [];
    if (unanswered > 0) {
      parts.push(`Bạn đã chọn <strong>${answered}/${total}</strong> câu, vẫn còn <strong>${unanswered}</strong> câu chưa trả lời.`);
    } else {
      parts.push(`Bạn đã hoàn thành đầy đủ <strong>${answered}/${total}</strong> câu hỏi.`);
    }
    if (flaggedCount > 0) {
      parts.push(`Có <strong>${flaggedCount}</strong> câu đang đánh dấu xem lại.`);
    }
    parts.push('Bấm <strong>Đồng ý nộp bài</strong> để ghi nhận kết quả và xem lời giải chi tiết.');
    this.els.confirmSubmitText.innerHTML = parts.join(' ');
  }
}
