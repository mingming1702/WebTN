import { escapeHtml } from '../core/formatters.js';
import { OPTION_KEYS, getExamCompletionSummary } from '../models/exam.model.js';
import { EDITOR_SECTIONS } from '../viewmodels/teacher-editor.viewmodel.js';

export class TeacherEditorView {
  constructor(editorVm, { onSaved, onCancel }) {
    this.vm = editorVm;
    this.onSaved = onSaved;
    this.onCancel = onCancel;

    this.els = {
      examListPanel: document.getElementById('examListPanel'),
      examEditorPanel: document.getElementById('examEditorPanel'),
      editorModeLabel: document.getElementById('editorModeLabel'),
      editorCompletionBadge: document.getElementById('editorCompletionBadge'),
      editorStatusNotice: document.getElementById('editorStatusNotice'),
      editorTitle: document.getElementById('editorTitle'),
      editorDuration: document.getElementById('editorDuration'),
      editorDesc: document.getElementById('editorDesc'),
      editorPublished: document.getElementById('editorPublished'),
      editorErrorBox: document.getElementById('editorErrorBox'),
      backToExamListBtn: document.getElementById('backToExamListBtn'),
      saveDraftBtn: document.getElementById('saveDraftBtn'),
      savePublishBtn: document.getElementById('savePublishBtn'),
      openQuickImportBtn: document.getElementById('openQuickImportBtn'),
      fillSampleMissingBtn: document.getElementById('fillSampleMissingBtn'),

      builderSectionTabs: document.getElementById('builderSectionTabs'),
      secCountSingle: document.getElementById('secCountSingle'),
      secCountGroup1: document.getElementById('secCountGroup1'),
      secCountGroup2: document.getElementById('secCountGroup2'),

      passageEditorWrap: document.getElementById('passageEditorWrap'),
      passageTitleInput: document.getElementById('passageTitleInput'),
      passageTextInput: document.getElementById('passageTextInput'),

      outlineListHeading: document.getElementById('outlineListHeading'),
      addNewQuestionBtn: document.getElementById('addNewQuestionBtn'),
      outlineQuestionList: document.getElementById('outlineQuestionList'),

      studioTargetBadge: document.getElementById('studioTargetBadge'),
      studioSectionLabel: document.getElementById('studioSectionLabel'),
      studioDeleteBtn: document.getElementById('studioDeleteBtn'),
      questionFormErrorBox: document.getElementById('questionFormErrorBox'),
      qTextInput: document.getElementById('qTextInput'),
      studioOptionsGrid: document.getElementById('studioOptionsGrid'),
      qExplanationInput: document.getElementById('qExplanationInput'),
      commitQuestionBtn: document.getElementById('commitQuestionBtn'),
      commitAndNextBtn: document.getElementById('commitAndNextBtn'),

      quickImportModal: document.getElementById('quickImportModal'),
      quickImportTextarea: document.getElementById('quickImportTextarea'),
      closeQuickImport: document.getElementById('closeQuickImport'),
      cancelQuickImport: document.getElementById('cancelQuickImport'),
      insertQuickSampleBtn: document.getElementById('insertQuickSampleBtn'),
      applyQuickImport: document.getElementById('applyQuickImport')
    };

    this._renderedTargetKey = '';
  }

  mount() {
    this._initOptionsGridOnce();
    this._bindEvents();
    this.unsubscribe = this.vm.subscribe((state) => this.render(state), true);
  }

  _initOptionsGridOnce() {
    this.els.studioOptionsGrid.innerHTML = OPTION_KEYS.map(
      (key) => `
        <div class="studio-option-row" data-option-row="${key}">
          <label class="studio-radio-pill">
            <input type="radio" name="studioCorrectAnswer" value="${key}" data-studio-radio="${key}" />
            <span>${key}</span>
          </label>
          <input
            type="text"
            class="form-control"
            placeholder="Nhập phương án ${key}..."
            data-studio-option="${key}"
          />
        </div>
      `
    ).join('');
  }

  _bindEvents() {
    this.els.editorTitle.addEventListener('input', (e) => {
      this.vm.updateExamMeta({ title: e.target.value });
    });
    this.els.editorDuration.addEventListener('input', (e) => {
      this.vm.updateExamMeta({ durationMinutes: Number(e.target.value) || 40 });
    });
    this.els.editorDesc.addEventListener('input', (e) => {
      this.vm.updateExamMeta({ description: e.target.value });
    });
    this.els.editorPublished.addEventListener('change', (e) => {
      this.vm.updateExamMeta({ isPublished: e.target.checked });
    });

    this.els.passageTitleInput.addEventListener('input', (e) => {
      const gIdx = this.vm.state.activeSection === EDITOR_SECTIONS.GROUP2 ? 1 : 0;
      this.vm.updatePassage(gIdx, 'passageTitle', e.target.value);
    });
    this.els.passageTextInput.addEventListener('input', (e) => {
      const gIdx = this.vm.state.activeSection === EDITOR_SECTIONS.GROUP2 ? 1 : 0;
      this.vm.updatePassage(gIdx, 'passage', e.target.value);
    });

    this.els.builderSectionTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-builder-section]');
      if (!btn) return;
      this.vm.setActiveSection(btn.getAttribute('data-builder-section'));
    });

    this.els.addNewQuestionBtn.addEventListener('click', () => {
      this.vm.startAddQuestion(this.vm.state.activeSection);
      this.els.qTextInput.focus();
    });

    this.els.outlineQuestionList.addEventListener('click', (e) => {
      const moveBtn = e.target.closest('[data-move-dir]');
      if (moveBtn) {
        e.stopPropagation();
        const idx = Number(moveBtn.getAttribute('data-q-idx'));
        const dir = Number(moveBtn.getAttribute('data-move-dir'));
        this.vm.moveQuestion(this.vm.state.activeSection, idx, dir);
        return;
      }

      const delBtn = e.target.closest('[data-del-q-idx]');
      if (delBtn) {
        e.stopPropagation();
        const idx = Number(delBtn.getAttribute('data-del-q-idx'));
        this.vm.deleteQuestion(this.vm.state.activeSection, idx);
        return;
      }

      const item = e.target.closest('[data-select-q-idx]');
      if (item) {
        const idx = Number(item.getAttribute('data-select-q-idx'));
        this.vm.selectQuestionToEdit(this.vm.state.activeSection, idx);
      }
    });

    this.els.qTextInput.addEventListener('input', (e) => {
      this.vm.updateQuestionFormField('question', e.target.value);
    });

    this.els.qExplanationInput.addEventListener('input', (e) => {
      this.vm.updateQuestionFormField('explanation', e.target.value);
    });

    this.els.studioOptionsGrid.addEventListener('input', (e) => {
      const optKey = e.target.getAttribute('data-studio-option');
      if (optKey) {
        this.vm.updateQuestionFormField(`option-${optKey}`, e.target.value);
      }
    });

    this.els.studioOptionsGrid.addEventListener('change', (e) => {
      const radioKey = e.target.getAttribute('data-studio-radio');
      if (radioKey) {
        this.vm.updateQuestionFormField('correctAnswer', radioKey);
      }
    });

    this.els.commitQuestionBtn.addEventListener('click', () => {
      this.vm.commitCurrentQuestion({ addNext: false });
    });

    this.els.commitAndNextBtn.addEventListener('click', () => {
      const res = this.vm.commitCurrentQuestion({ addNext: true });
      if (res.ok) {
        this.els.qTextInput.focus();
      }
    });

    this.els.studioDeleteBtn.addEventListener('click', () => {
      const { section, index } = this.vm.state.editingTarget;
      if (index !== null) {
        this.vm.deleteQuestion(section, index);
      }
    });

    this.els.fillSampleMissingBtn.addEventListener('click', () => {
      this.vm.fillMissingSamples();
    });

    this.els.openQuickImportBtn.addEventListener('click', () => this.vm.openQuickImport());
    this.els.closeQuickImport.addEventListener('click', () => this.vm.closeQuickImport());
    this.els.cancelQuickImport.addEventListener('click', () => this.vm.closeQuickImport());
    this.els.quickImportTextarea.addEventListener('input', (e) => {
      this.vm.setQuickImportText(e.target.value);
    });
    this.els.insertQuickSampleBtn.addEventListener('click', () => this.vm.insertQuickSample());
    this.els.applyQuickImport.addEventListener('click', () => {
      const count = this.vm.applyQuickImport();
      if (count === 0) {
        window.alert('Chưa nhận diện được câu hỏi nào. Hãy kiểm tra lại định dạng "Câu 1: ... A. ... B. ... C. ... D. ... Đáp án: A".');
      }
    });

    this.els.backToExamListBtn.addEventListener('click', () => {
      if (this.vm.state.isDirty && !window.confirm('Bạn có thay đổi chưa lưu. Quay lại danh sách?')) {
        return;
      }
      this.vm.close();
      this.onCancel?.();
    });

    this.els.saveDraftBtn.addEventListener('click', async () => {
      const res = await this.vm.saveExam({ publishOverride: false });
      if (res.ok) {
        this.vm.close();
        await this.onSaved?.(res.exam);
      } else {
        this.els.editorErrorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    this.els.savePublishBtn.addEventListener('click', async () => {
      const res = await this.vm.saveExam({ publishOverride: true });
      if (res.ok) {
        this.vm.close();
        await this.onSaved?.(res.exam);
      } else {
        this.els.editorErrorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  _syncInputIfUnfocused(el, value) {
    if (document.activeElement !== el && el.value !== value) {
      el.value = value;
    }
  }

  render(state) {
    this.els.examEditorPanel.classList.toggle('hidden', !state.isOpen);
    this.els.examListPanel.classList.toggle('hidden', state.isOpen);
    if (!state.isOpen || !state.exam) return;

    const exam = state.exam;
    const summary = getExamCompletionSummary(exam);

    this.els.editorModeLabel.textContent = state.isNew ? 'Tạo bài tập mới' : 'Chỉnh sửa bài tập';
    this.els.editorCompletionBadge.textContent = `Hoàn thành: ${summary.completedCount} / 30 câu`;
    this.els.editorCompletionBadge.className = summary.isComplete30 ? 'badge badge-green' : 'badge badge-blue';

    if (state.statusNotice) {
      this.els.editorStatusNotice.classList.remove('hidden');
      this.els.editorStatusNotice.textContent = state.statusNotice;
    } else {
      this.els.editorStatusNotice.classList.add('hidden');
    }

    this._syncInputIfUnfocused(this.els.editorTitle, exam.title || '');
    this._syncInputIfUnfocused(this.els.editorDuration, String(exam.durationMinutes || 40));
    this._syncInputIfUnfocused(this.els.editorDesc, exam.description || '');
    this.els.editorPublished.checked = exam.isPublished !== false;

    this.els.saveDraftBtn.disabled = state.isSaving;
    this.els.savePublishBtn.disabled = state.isSaving;

    this._renderExamErrors(state.examErrors);
    this._renderOutline(state, summary);
    this._renderStudio(state);
    this._renderQuickImportModal(state);
  }

  _renderExamErrors(errors) {
    if (!errors.length) {
      this.els.editorErrorBox.classList.add('hidden');
      return;
    }
    this.els.editorErrorBox.classList.remove('hidden');
    this.els.editorErrorBox.innerHTML = `
      <div>
        <strong>Cần hoàn thiện ${errors.length} mục:</strong>
        <ul style="margin:6px 0 0 18px; padding:0;">
          ${errors.slice(0, 6).map((err) => `<li>${escapeHtml(err)}</li>`).join('')}
          ${errors.length > 6 ? `<li>... và ${errors.length - 6} mục khác.</li>` : ''}
        </ul>
      </div>
    `;
  }

  _renderOutline(state, summary) {
    this.els.secCountSingle.textContent = `${summary.singleCount} / 20`;
    this.els.secCountGroup1.textContent = `${summary.group1Count} / 5`;
    this.els.secCountGroup2.textContent = `${summary.group2Count} / 5`;

    this.els.builderSectionTabs.querySelectorAll('[data-builder-section]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-builder-section') === state.activeSection);
    });

    const isGroup = state.activeSection !== EDITOR_SECTIONS.SINGLE;
    this.els.passageEditorWrap.classList.toggle('hidden', !isGroup);
    if (isGroup) {
      const gIdx = state.activeSection === EDITOR_SECTIONS.GROUP2 ? 1 : 0;
      const group = state.exam.groups[gIdx] || {};
      this._syncInputIfUnfocused(this.els.passageTitleInput, group.passageTitle || '');
      this._syncInputIfUnfocused(this.els.passageTextInput, group.passage || '');
    }

    const list =
      state.activeSection === EDITOR_SECTIONS.SINGLE
        ? state.exam.singleQuestions
        : state.activeSection === EDITOR_SECTIONS.GROUP1
          ? state.exam.groups[0].questions
          : state.exam.groups[1].questions;
    const limit = state.activeSection === EDITOR_SECTIONS.SINGLE ? 20 : 5;
    const startNum = state.activeSection === EDITOR_SECTIONS.GROUP1 ? 21 : state.activeSection === EDITOR_SECTIONS.GROUP2 ? 26 : 1;

    this.els.outlineListHeading.textContent = `Câu hỏi trong phần này (${list.length}/${limit})`;
    this.els.addNewQuestionBtn.disabled = list.length >= limit;

    if (!list.length) {
      this.els.outlineQuestionList.innerHTML = `
        <div style="padding:18px; text-align:center; border:1px dashed var(--border-strong); border-radius:10px; color:var(--text-muted); font-size:13.5px;">
          Chưa có câu hỏi nào ở phần này. Hãy nhập câu hỏi ở khung bên phải rồi bấm <strong>Lưu &amp; Thêm câu tiếp theo</strong>.
        </div>
      `;
      return;
    }

    this.els.outlineQuestionList.innerHTML = list
      .map((q, idx) => {
        const isSelected =
          state.editingTarget.section === state.activeSection && state.editingTarget.index === idx;
        const snippet = String(q.question || '').trim() || '(Chưa có nội dung)';
        return `
          <div class="outline-q-item ${isSelected ? 'active' : ''}" data-select-q-idx="${idx}">
            <div class="outline-q-main">
              <div class="outline-q-meta">
                <span class="badge badge-blue" style="padding:2px 8px; font-size:11.5px;">Câu ${startNum + idx}</span>
                <span class="badge badge-green" style="padding:2px 8px; font-size:11.5px;">Đáp án ${q.correctAnswer}</span>
              </div>
              <div class="outline-q-snippet">${escapeHtml(snippet)}</div>
            </div>
            <div class="outline-q-controls">
              <button type="button" class="btn btn-outline btn-xs" data-q-idx="${idx}" data-move-dir="-1" ${idx === 0 ? 'disabled' : ''} title="Đưa lên">↑</button>
              <button type="button" class="btn btn-outline btn-xs" data-q-idx="${idx}" data-move-dir="1" ${idx === list.length - 1 ? 'disabled' : ''} title="Đưa xuống">↓</button>
              <button type="button" class="btn btn-danger-soft btn-xs" data-del-q-idx="${idx}" title="Xóa câu">✕</button>
            </div>
          </div>
        `;
      })
      .join('');
  }

  _renderStudio(state) {
    const num = this.vm.getActiveQuestionDisplayNumber();
    const isEditing = state.editingTarget.index !== null;
    const sectionLabelMap = {
      [EDITOR_SECTIONS.SINGLE]: 'Phần I • Câu đơn (1–20)',
      [EDITOR_SECTIONS.GROUP1]: 'Phần II • Đọc hiểu 1 (21–25)',
      [EDITOR_SECTIONS.GROUP2]: 'Phần III • Đọc hiểu 2 (26–30)'
    };

    this.els.studioTargetBadge.textContent = isEditing ? `Đang sửa Câu ${num}` : `Đang thêm Câu ${num}`;
    this.els.studioTargetBadge.className = isEditing ? 'badge badge-amber' : 'badge badge-blue';
    this.els.studioSectionLabel.textContent = sectionLabelMap[state.editingTarget.section] || '';
    this.els.studioDeleteBtn.classList.toggle('hidden', !isEditing);

    if (state.questionFormErrors.length) {
      this.els.questionFormErrorBox.classList.remove('hidden');
      this.els.questionFormErrorBox.innerHTML = `
        <div>${state.questionFormErrors.map((e) => escapeHtml(e)).join('<br/>')}</div>
      `;
    } else {
      this.els.questionFormErrorBox.classList.add('hidden');
    }

    this._syncInputIfUnfocused(this.els.qTextInput, state.questionForm.question || '');
    this._syncInputIfUnfocused(this.els.qExplanationInput, state.questionForm.explanation || '');

    OPTION_KEYS.forEach((key) => {
      const row = this.els.studioOptionsGrid.querySelector(`[data-option-row="${key}"]`);
      const radio = this.els.studioOptionsGrid.querySelector(`[data-studio-radio="${key}"]`);
      const input = this.els.studioOptionsGrid.querySelector(`[data-studio-option="${key}"]`);
      const isCorrect = state.questionForm.correctAnswer === key;

      row.classList.toggle('is-correct', isCorrect);
      radio.checked = isCorrect;
      this._syncInputIfUnfocused(input, state.questionForm.options?.[key] || '');
    });

    this.els.commitQuestionBtn.textContent = isEditing ? `Cập nhật Câu ${num}` : `Lưu Câu ${num}`;
  }

  _renderQuickImportModal(state) {
    this.els.quickImportModal.classList.toggle('hidden', !state.quickImportOpen);
    if (state.quickImportOpen) {
      this._syncInputIfUnfocused(this.els.quickImportTextarea, state.quickImportText || '');
    }
  }
}
