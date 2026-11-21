import {
  escapeHtml,
  formatDateTime,
  formatDurationText
} from '../core/formatters.js';
import { flattenExamQuestions, getExamCompletionSummary } from '../models/exam.model.js';
import { SCORE_SCALE, getScoreBadgeClass } from '../models/grading.model.js';

export class TeacherView {
  constructor({ authVm, examsVm, editorVm, scoresVm, settingsVm }) {
    this.authVm = authVm;
    this.examsVm = examsVm;
    this.editorVm = editorVm;
    this.scoresVm = scoresVm;
    this.settingsVm = settingsVm;
    this.activeMainTab = 'exams';

    this.els = {
      pinGateSection: document.getElementById('pinGateSection'),
      pinForm: document.getElementById('pinForm'),
      pinInput: document.getElementById('pinInput'),
      pinError: document.getElementById('pinError'),
      lockTeacherBtn: document.getElementById('lockTeacherBtn'),

      teacherApp: document.getElementById('teacherApp'),
      teacherStorageBadge: document.getElementById('teacherStorageBadge'),
      localModeNotice: document.getElementById('localModeNotice'),

      tabExams: document.getElementById('tabExams'),
      tabScores: document.getElementById('tabScores'),
      tabSettings: document.getElementById('tabSettings'),

      teacherExamList: document.getElementById('teacherExamList'),
      createExamBtn: document.getElementById('createExamBtn'),
      importJsonFileInput: document.getElementById('importJsonFileInput'),

      scoreStatsGrid: document.getElementById('scoreStatsGrid'),
      wrongStatsCard: document.getElementById('wrongStatsCard'),
      wrongStatsGrid: document.getElementById('wrongStatsGrid'),
      filterScoreExam: document.getElementById('filterScoreExam'),
      searchScoreStudent: document.getElementById('searchScoreStudent'),
      refreshScoresBtn: document.getElementById('refreshScoresBtn'),
      exportCsvBtn: document.getElementById('exportCsvBtn'),
      scoresGroupedContainer: document.getElementById('scoresGroupedContainer'),

      submissionDetailModal: document.getElementById('submissionDetailModal'),
      subDetailTitle: document.getElementById('subDetailTitle'),
      subDetailBody: document.getElementById('subDetailBody'),
      closeSubDetail: document.getElementById('closeSubDetail'),

      cloudConfigForm: document.getElementById('cloudConfigForm'),
      supabaseUrlInput: document.getElementById('supabaseUrlInput'),
      supabaseKeyInput: document.getElementById('supabaseKeyInput'),
      disconnectCloudBtn: document.getElementById('disconnectCloudBtn'),
      cloudStatusMsg: document.getElementById('cloudStatusMsg'),

      changePinForm: document.getElementById('changePinForm'),
      newPinInput: document.getElementById('newPinInput'),
      pinChangeMsg: document.getElementById('pinChangeMsg'),

      resetDemoDataBtn: document.getElementById('resetDemoDataBtn'),
      resetDemoMsg: document.getElementById('resetDemoMsg')
    };
  }

  mount() {
    this._bindEvents();
    this.authVm.subscribe((state) => this._renderAuth(state), true);
    this.examsVm.subscribe((state) => this._renderExamsList(state), true);
    this.scoresVm.subscribe((state) => this._renderScores(state), true);
    this.settingsVm.subscribe((state) => this._renderSettings(state), true);
  }

  _bindEvents() {
    this.els.pinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (this.authVm.verifyPin(this.els.pinInput.value)) {
        this.els.pinInput.value = '';
        await this.onUnlocked();
      }
    });

    this.els.lockTeacherBtn.addEventListener('click', () => {
      this.editorVm.close();
      this.authVm.lock();
    });

    document.querySelectorAll('[data-main-tab]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const tab = btn.getAttribute('data-main-tab');
        this.switchMainTab(tab);
        if (tab === 'scores') {
          await this.scoresVm.loadScores();
        }
      });
    });

    this.els.createExamBtn.addEventListener('click', () => {
      this.editorVm.openNew();
    });

    this.els.importJsonFileInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        this.editorVm.importFromJsonText(text);
      } catch (err) {
        window.alert(`File JSON không hợp lệ: ${err.message}`);
      } finally {
        e.target.value = '';
      }
    });

    this.els.teacherExamList.addEventListener('click', async (e) => {
      const emptyBtn = e.target.closest('#emptyCreateBtn');
      if (emptyBtn) {
        this.editorVm.openNew();
        return;
      }

      const editBtn = e.target.closest('[data-edit-exam]');
      if (editBtn) {
        const exam = this.examsVm.state.exams.find((x) => x.id === editBtn.getAttribute('data-edit-exam'));
        if (exam) this.editorVm.openExisting(exam);
        return;
      }

      const toggleBtn = e.target.closest('[data-toggle-pub]');
      if (toggleBtn) {
        await this.examsVm.togglePublish(toggleBtn.getAttribute('data-toggle-pub'));
        return;
      }

      const dupBtn = e.target.closest('[data-dup-exam]');
      if (dupBtn) {
        await this.examsVm.duplicateExam(dupBtn.getAttribute('data-dup-exam'));
        return;
      }

      const copyBtn = e.target.closest('[data-copy-link]');
      if (copyBtn) {
        const id = copyBtn.getAttribute('data-copy-link');
        const mode = copyBtn.getAttribute('data-copy-mode') || 'practice';
        const url = this.examsVm.buildShareUrl(id, window.location.origin, mode);
        try {
          await navigator.clipboard.writeText(url);
          this.examsVm.markCopied(id, mode);
          setTimeout(() => this.examsVm.clearCopied(), 1800);
        } catch {
          window.prompt('Sao chép đường dẫn giao bài cho học sinh:', url);
        }
        return;
      }

      const jsonBtn = e.target.closest('[data-export-json]');
      if (jsonBtn) {
        const exam = this.examsVm.state.exams.find((x) => x.id === jsonBtn.getAttribute('data-export-json'));
        if (!exam) return;
        const blob = new Blob([JSON.stringify(exam, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${exam.id}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
        return;
      }

      const delBtn = e.target.closest('[data-delete-exam]');
      if (delBtn) {
        const id = delBtn.getAttribute('data-delete-exam');
        const exam = this.examsVm.state.exams.find((x) => x.id === id);
        if (!exam) return;
        if (!window.confirm(`Bạn có chắc muốn xóa bài tập "${exam.title}" không?`)) return;
        await this.examsVm.deleteExam(id);
      }
    });

    this.els.filterScoreExam.addEventListener('change', (e) => {
      this.scoresVm.setFilterExamId(e.target.value);
    });
    this.els.searchScoreStudent.addEventListener('input', (e) => {
      this.scoresVm.setSearchQuery(e.target.value);
    });
    this.els.refreshScoresBtn.addEventListener('click', () => this.scoresVm.loadScores());
    this.els.exportCsvBtn.addEventListener('click', () => {
      const csv = this.scoresVm.buildCsvContent();
      if (!csv) {
        window.alert('Không có dữ liệu điểm để xuất.');
        return;
      }
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `bang-diem-tieng-viet-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    });

    this.els.scoresGroupedContainer.addEventListener('click', async (e) => {
      const viewBtn = e.target.closest('[data-view-sub]');
      if (viewBtn) {
        await this.scoresVm.openDetail(viewBtn.getAttribute('data-view-sub'));
        return;
      }
      const delBtn = e.target.closest('[data-del-sub]');
      if (delBtn) {
        if (!window.confirm('Xóa kết quả bài làm này?')) return;
        await this.scoresVm.deleteSubmission(delBtn.getAttribute('data-del-sub'));
      }
    });

    this.els.closeSubDetail.addEventListener('click', () => this.scoresVm.closeDetail());

    this.els.cloudConfigForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      this.settingsVm.saveCloudConfig(this.els.supabaseUrlInput.value, this.els.supabaseKeyInput.value);
      await this.authVm.refreshStorageMode();
      await this.examsVm.loadExams();
    });

    this.els.disconnectCloudBtn.addEventListener('click', async () => {
      this.settingsVm.disconnectCloud();
      await this.authVm.refreshStorageMode();
      await this.examsVm.loadExams();
    });

    this.els.changePinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.settingsVm.updatePin(this.els.newPinInput.value)) {
        this.els.newPinInput.value = '';
      }
    });

    this.els.resetDemoDataBtn.addEventListener('click', async () => {
      if (!window.confirm('Khôi phục lại đầy đủ 5 bộ đề mẫu Đề 11 – Đề 15?')) return;
      await this.settingsVm.resetDemoData();
      await this.examsVm.loadExams();
      await this.scoresVm.loadScores();
    });
  }

  async onUnlocked() {
    this.settingsVm.loadConfig();
    await this.authVm.refreshStorageMode();
    await this.examsVm.loadExams();
  }

  switchMainTab(tabName) {
    this.activeMainTab = tabName;
    document.querySelectorAll('[data-main-tab]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-main-tab') === tabName);
    });
    this.els.tabExams.classList.toggle('hidden', tabName !== 'exams');
    this.els.tabScores.classList.toggle('hidden', tabName !== 'scores');
    this.els.tabSettings.classList.toggle('hidden', tabName !== 'settings');
  }

  _renderAuth(state) {
    this.els.pinGateSection.classList.toggle('hidden', state.unlocked);
    this.els.teacherApp.classList.toggle('hidden', !state.unlocked);
    this.els.lockTeacherBtn.classList.toggle('hidden', !state.unlocked);

    if (state.pinError) {
      this.els.pinError.classList.remove('hidden');
      this.els.pinError.innerHTML = `<span>${escapeHtml(state.pinError)}</span>`;
    } else {
      this.els.pinError.classList.add('hidden');
    }

    const isCloud = state.storageMode?.mode === 'supabase';
    this.els.teacherStorageBadge.textContent = isCloud ? 'Đồng bộ Cloud (Supabase)' : 'Lưu cục bộ (LocalStorage)';
    this.els.teacherStorageBadge.className = isCloud ? 'badge badge-green' : 'badge badge-blue';
    this.els.localModeNotice.classList.toggle('hidden', isCloud);
  }

  _renderExamsList(state) {
    this._syncScoreExamFilter(state.exams);

    if (state.loading) {
      this.els.teacherExamList.innerHTML = `
        <div class="card" style="grid-column:1/-1;">
          <div class="card-body" style="text-align:center; padding:32px; color:var(--text-secondary);">
            Đang tải danh sách bài tập...
          </div>
        </div>
      `;
      return;
    }

    if (!state.exams.length) {
      this.els.teacherExamList.innerHTML = `
        <div class="card" style="grid-column:1/-1;">
          <div class="card-body" style="text-align:center; padding:36px;">
            <p style="margin:0 0 12px; color:var(--text-secondary);">Chưa có bài tập nào.</p>
            <button type="button" class="btn btn-primary" id="emptyCreateBtn">+ Tạo bài tập mới</button>
          </div>
        </div>
      `;
      return;
    }

    this.els.teacherExamList.innerHTML = state.exams
      .map((exam) => {
        const summary = getExamCompletionSummary(exam);
        const pct = Math.min(100, Math.round((summary.completedCount / 30) * 100));
        const publishedBadge =
          exam.isPublished !== false
            ? '<span class="badge badge-green">Đang giao (Mở)</span>'
            : '<span class="badge badge-amber">Bản nháp (Ẩn)</span>';
        const isCopiedPractice =
          state.copiedNotice?.examId === exam.id && state.copiedNotice?.mode === 'practice';

        return `
          <article class="card">
            <div class="card-body">
              <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap;">
                ${publishedBadge}
                <span class="badge">${summary.completedCount}/30 câu • ${Number(exam.durationMinutes) || 40} phút</span>
              </div>
              <h3 class="exam-card-title">${escapeHtml(exam.title)}</h3>
              <p class="exam-card-desc">${escapeHtml(exam.description || 'Chưa có mô tả.')}</p>
              <div class="teacher-exam-progress ${summary.isComplete30 ? 'complete' : ''}">
                <div style="width:${pct}%"></div>
              </div>
              <div style="display:flex; gap:7px; flex-wrap:wrap;">
                <button type="button" class="btn btn-primary btn-sm" data-edit-exam="${escapeHtml(exam.id)}">Soạn / Sửa câu</button>
                <a href="/exam?id=${encodeURIComponent(exam.id)}&mode=practice" target="_blank" rel="noopener" class="btn btn-soft btn-sm">Xem thử</a>
                <button type="button" class="btn btn-outline btn-sm" data-copy-link="${escapeHtml(exam.id)}" data-copy-mode="practice">
                  ${isCopiedPractice ? 'Đã copy link!' : 'Copy link bài tập'}
                </button>
                <button type="button" class="btn btn-outline btn-sm" data-toggle-pub="${escapeHtml(exam.id)}">
                  ${exam.isPublished !== false ? 'Ẩn bài' : 'Mở giao bài'}
                </button>
                <button type="button" class="btn btn-outline btn-sm" data-dup-exam="${escapeHtml(exam.id)}">Nhân bản</button>
                <button type="button" class="btn btn-outline btn-sm" data-export-json="${escapeHtml(exam.id)}">Tải JSON</button>
                <button type="button" class="btn btn-danger-soft btn-sm" data-delete-exam="${escapeHtml(exam.id)}">Xóa</button>
              </div>
            </div>
          </article>
        `;
      })
      .join('');
  }

  _syncScoreExamFilter(exams) {
    const current = this.els.filterScoreExam.value;
    this.els.filterScoreExam.innerHTML =
      '<option value="">Tất cả bài tập</option>' +
      exams.map((e) => `<option value="${escapeHtml(e.id)}">${escapeHtml(e.title)}</option>`).join('');
    this.els.filterScoreExam.value = current;
  }

  _renderScores(state) {
    const exams = this.examsVm.state.exams;
    const { stats, topWrong } = this.scoresVm.getDashboardAnalytics(exams);

    this.els.scoreStatsGrid.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">Tổng lượt nộp bài</div>
        <div class="stat-value">${stats.totalCount}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Điểm trung bình</div>
        <div class="stat-value">${stats.avgScore} / ${SCORE_SCALE}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Điểm cao nhất</div>
        <div class="stat-value">${stats.maxScore} / ${SCORE_SCALE}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Tỷ lệ đạt ≥ 80%</div>
        <div class="stat-value">${stats.highRate}%</div>
      </div>
    `;

    if (topWrong.length) {
      this.els.wrongStatsCard.classList.remove('hidden');
      this.els.wrongStatsGrid.innerHTML = topWrong
        .map((item) => {
          const snippet = item.question.length > 78 ? `${item.question.slice(0, 78)}...` : item.question;
          return `
            <div class="wrong-stat-item">
              <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:6px;">
                <span class="badge badge-red">Câu ${item.number}</span>
                <strong style="font-size:13px; color:var(--danger);">Sai ${item.wrong}/${item.total} lượt (${item.rate}%)</strong>
              </div>
              <div style="font-size:13px; color:var(--text); font-weight:500;">${escapeHtml(snippet)}</div>
              <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">${escapeHtml(item.examTitle)}</div>
            </div>
          `;
        })
        .join('');
    } else {
      this.els.wrongStatsCard.classList.add('hidden');
    }

    const groups = this.scoresVm.getGroupedSubmissions(exams);
    if (!groups.length) {
      this.els.scoresGroupedContainer.innerHTML = `
        <div class="card">
          <div class="card-body" style="text-align:center; padding:32px; color:var(--text-muted);">
            Chưa có kết quả bài làm nào phù hợp.
          </div>
        </div>
      `;
    } else {
      this.els.scoresGroupedContainer.innerHTML = groups
        .map((group) => {
          const groupAvg = (
            group.items.reduce((sum, s) => sum + Number(s.score || 0), 0) / group.items.length
          ).toFixed(2);

          const rowsHtml = group.items
            .map((s) => {
              const badgeClass = getScoreBadgeClass(s.correctCount, s.totalQuestions);
              const classLabel = s.studentClass ? ` (${escapeHtml(s.studentClass)})` : '';
              return `
                <tr>
                  <td><strong>${escapeHtml(s.studentName)}</strong>${classLabel}</td>
                  <td>${s.correctCount} / ${s.totalQuestions}</td>
                  <td><span class="badge ${badgeClass}">${s.score} / ${SCORE_SCALE}</span></td>
                  <td>${formatDurationText(s.elapsedSeconds)}</td>
                  <td>${formatDateTime(s.submittedAt)}</td>
                  <td>
                    <div style="display:flex; gap:6px;">
                      <button type="button" class="btn btn-soft btn-sm" data-view-sub="${escapeHtml(s.id)}">Xem bài</button>
                      <button type="button" class="btn btn-danger-soft btn-sm" data-del-sub="${escapeHtml(s.id)}">Xóa</button>
                    </div>
                  </td>
                </tr>
              `;
            })
            .join('');

          return `
            <div class="card" style="margin-bottom:18px;">
              <div class="card-body">
                <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; margin-bottom:12px;">
                  <h3 style="margin:0; font-size:17px;">${escapeHtml(group.examTitle)}</h3>
                  <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    <span class="badge badge-blue">${group.items.length} lượt nộp</span>
                    <span class="badge badge-green">Trung bình: ${groupAvg} / ${SCORE_SCALE}</span>
                  </div>
                </div>
                <div class="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Học sinh</th>
                        <th>Số câu đúng</th>
                        <th>Điểm (/${SCORE_SCALE})</th>
                        <th>Thời gian làm</th>
                        <th>Thời điểm nộp</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>${rowsHtml}</tbody>
                  </table>
                </div>
              </div>
            </div>
          `;
        })
        .join('');
    }

    this._renderSubmissionDetailModal(state.detailModal);
  }

  _renderSubmissionDetailModal(detailModal) {
    this.els.submissionDetailModal.classList.toggle('hidden', !detailModal.open);
    if (!detailModal.open || !detailModal.submission) return;

    const sub = detailModal.submission;
    const exam = detailModal.exam;
    const classLabel = sub.studentClass ? ` (${sub.studentClass})` : '';
    this.els.subDetailTitle.textContent = `${sub.studentName}${classLabel} – ${sub.score}/${SCORE_SCALE} (${sub.correctCount}/${sub.totalQuestions} câu đúng)`;

    const metaBanner = `
      <div class="alert alert-info" style="margin-bottom:12px;">
        <span>
          Bài tập: <strong>${escapeHtml(sub.examTitle)}</strong> •
          Thời gian làm: <strong>${formatDurationText(sub.elapsedSeconds)}</strong> •
          Nộp lúc: <strong>${formatDateTime(sub.submittedAt)}</strong>
        </span>
      </div>
    `;

    if (!exam) {
      this.els.subDetailBody.innerHTML =
        metaBanner + '<p>Bài tập gốc đã bị xóa nên không thể hiển thị chi tiết từng câu hỏi.</p>';
      return;
    }

    const flat = flattenExamQuestions(exam);
    this.els.subDetailBody.innerHTML =
      metaBanner +
      `<div style="display:grid; gap:10px;">
        ${flat
          .map((q) => {
            const chosen = sub.answers?.[String(q.number)] || '';
            const ok = chosen === q.correctAnswer;
            return `
              <div style="padding:10px 12px; border-radius:10px; border:1px solid ${ok ? 'var(--success-border)' : 'var(--danger-border)'}; background:${ok ? '#f0fdf4' : '#fef2f2'};">
                <div style="font-weight:600; margin-bottom:4px;">Câu ${q.number}: ${escapeHtml(q.question)}</div>
                <div style="font-size:13.5px;">
                  Học sinh chọn: <strong>${chosen || 'Bỏ trống'}</strong> •
                  Đáp án đúng: <strong style="color:var(--success);">${q.correctAnswer}</strong>
                  ${ok ? '✓' : '✗'}
                </div>
              </div>
            `;
          })
          .join('')}
      </div>`;
  }

  _renderSettings(state) {
    if (document.activeElement !== this.els.supabaseUrlInput) {
      this.els.supabaseUrlInput.value = state.supabaseUrl || '';
    }
    if (document.activeElement !== this.els.supabaseKeyInput) {
      this.els.supabaseKeyInput.value = state.supabaseAnonKey || '';
    }

    this.els.cloudStatusMsg.innerHTML = state.cloudMessage
      ? `<span class="badge badge-${state.cloudMessage.type}">${escapeHtml(state.cloudMessage.text)}</span>`
      : '';
    this.els.pinChangeMsg.innerHTML = state.pinMessage
      ? `<span class="badge badge-${state.pinMessage.type}">${escapeHtml(state.pinMessage.text)}</span>`
      : '';
    this.els.resetDemoMsg.innerHTML = state.resetMessage
      ? `<span class="badge badge-${state.resetMessage.type}">${escapeHtml(state.resetMessage.text)}</span>`
      : '';
  }
}
