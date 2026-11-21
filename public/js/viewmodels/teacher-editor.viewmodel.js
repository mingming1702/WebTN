import { generateId } from '../core/id.js';
import { BaseViewModel } from '../core/observable.js';
import {
  GROUP_SECTION_LIMIT,
  OPTION_KEYS,
  SINGLE_SECTION_LIMIT,
  createEmptyExamTemplate,
  createEmptyQuestion,
  getExamCompletionSummary,
  normalizeExam,
  renumberExamQuestions,
  validateExam,
  validateQuestionInput
} from '../models/exam.model.js';
import { buildQuickSampleText30, parseQuickText } from '../models/quick-parser.model.js';
import { defaultRepository } from '../models/storage.repository.js';

export const EDITOR_SECTIONS = {
  SINGLE: 'single',
  GROUP1: 'group1',
  GROUP2: 'group2'
};

function createBlankForm() {
  return {
    question: '',
    options: { A: '', B: '', C: '', D: '' },
    correctAnswer: 'A',
    explanation: ''
  };
}

function getSectionQuestions(exam, section) {
  if (!exam) return [];
  if (section === EDITOR_SECTIONS.SINGLE) return exam.singleQuestions || [];
  if (section === EDITOR_SECTIONS.GROUP1) return exam.groups?.[0]?.questions || [];
  if (section === EDITOR_SECTIONS.GROUP2) return exam.groups?.[1]?.questions || [];
  return [];
}

function getSectionLimit(section) {
  return section === EDITOR_SECTIONS.SINGLE ? SINGLE_SECTION_LIMIT : GROUP_SECTION_LIMIT;
}

function getSectionStartNumber(section) {
  if (section === EDITOR_SECTIONS.GROUP1) return 21;
  if (section === EDITOR_SECTIONS.GROUP2) return 26;
  return 1;
}

function hasAnyFormInput(form) {
  if (!form) return false;
  return Boolean(
    String(form.question || '').trim() ||
      String(form.explanation || '').trim() ||
      OPTION_KEYS.some((k) => String(form.options?.[k] || '').trim())
  );
}

export class TeacherEditorViewModel extends BaseViewModel {
  constructor(repository = defaultRepository) {
    super({
      isOpen: false,
      isNew: true,
      exam: null,
      activeSection: EDITOR_SECTIONS.SINGLE,
      editingTarget: { section: EDITOR_SECTIONS.SINGLE, index: null },
      questionForm: createBlankForm(),
      questionFormErrors: [],
      examErrors: [],
      statusNotice: '',
      quickImportOpen: false,
      quickImportText: '',
      isDirty: false,
      isSaving: false
    });
    this.repository = repository;
  }

  openNew() {
    const exam = createEmptyExamTemplate({ prefillQuestions: false, isPublished: false });
    this.setState({
      isOpen: true,
      isNew: true,
      exam,
      activeSection: EDITOR_SECTIONS.SINGLE,
      editingTarget: { section: EDITOR_SECTIONS.SINGLE, index: null },
      questionForm: createBlankForm(),
      questionFormErrors: [],
      examErrors: [],
      statusNotice: '',
      quickImportOpen: false,
      quickImportText: '',
      isDirty: false,
      isSaving: false
    });
  }

  openExisting(rawExam) {
    const exam = normalizeExam(structuredClone(rawExam));
    const hasSingle = exam.singleQuestions.length > 0;
    const index = hasSingle ? 0 : null;
    const form = hasSingle
      ? {
          question: exam.singleQuestions[0].question,
          options: { ...exam.singleQuestions[0].options },
          correctAnswer: exam.singleQuestions[0].correctAnswer,
          explanation: exam.singleQuestions[0].explanation || ''
        }
      : createBlankForm();

    this.setState({
      isOpen: true,
      isNew: false,
      exam,
      activeSection: EDITOR_SECTIONS.SINGLE,
      editingTarget: { section: EDITOR_SECTIONS.SINGLE, index },
      questionForm: form,
      questionFormErrors: [],
      examErrors: [],
      statusNotice: '',
      quickImportOpen: false,
      quickImportText: '',
      isDirty: false,
      isSaving: false
    });
  }

  close() {
    this.setState({
      isOpen: false,
      exam: null,
      questionFormErrors: [],
      examErrors: [],
      statusNotice: '',
      quickImportOpen: false,
      isDirty: false
    });
  }

  updateExamMeta(patch) {
    if (!this.state.exam) return;
    this.setState({
      exam: { ...this.state.exam, ...patch },
      examErrors: [],
      isDirty: true
    });
  }

  updatePassage(groupIndex, field, value) {
    if (!this.state.exam) return;
    const exam = structuredClone(this.state.exam);
    if (!exam.groups[groupIndex]) return;
    exam.groups[groupIndex][field] = value;
    this.setState({ exam, examErrors: [], isDirty: true });
  }

  setActiveSection(section) {
    if (!this.state.exam) return;
    const list = getSectionQuestions(this.state.exam, section);
    if (list.length > 0) {
      this.selectQuestionToEdit(section, 0);
    } else {
      this.startAddQuestion(section);
    }
  }

  startAddQuestion(section = this.state.activeSection) {
    if (!this.state.exam) return;
    const list = getSectionQuestions(this.state.exam, section);
    const limit = getSectionLimit(section);

    if (list.length >= limit) {
      this.setState({
        activeSection: section,
        statusNotice: `Phần này đã đủ ${limit}/${limit} câu hỏi. Hãy chọn một câu trong danh sách để chỉnh sửa.`
      });
      return;
    }

    this.setState({
      activeSection: section,
      editingTarget: { section, index: null },
      questionForm: createBlankForm(),
      questionFormErrors: [],
      statusNotice: ''
    });
  }

  selectQuestionToEdit(section, index) {
    if (!this.state.exam) return;
    const list = getSectionQuestions(this.state.exam, section);
    const q = list[index];
    if (!q) return;

    this.setState({
      activeSection: section,
      editingTarget: { section, index },
      questionForm: {
        question: q.question || '',
        options: { ...q.options },
        correctAnswer: q.correctAnswer || 'A',
        explanation: q.explanation || ''
      },
      questionFormErrors: [],
      statusNotice: ''
    });
  }

  updateQuestionFormField(field, value) {
    const prev = this.state.questionForm;
    let next;
    if (field.startsWith('option-')) {
      const optKey = field.split('-')[1];
      next = {
        ...prev,
        options: { ...prev.options, [optKey]: value }
      };
    } else {
      next = { ...prev, [field]: value };
    }
    this.setState({
      questionForm: next,
      questionFormErrors: [],
      statusNotice: '',
      isDirty: true
    });
  }

  getActiveQuestionDisplayNumber() {
    const { exam, editingTarget } = this.state;
    const start = getSectionStartNumber(editingTarget.section);
    if (editingTarget.index !== null) {
      return start + editingTarget.index;
    }
    const existingCount = getSectionQuestions(exam, editingTarget.section).length;
    return start + existingCount;
  }

  commitCurrentQuestion({ addNext = false } = {}) {
    const { exam, editingTarget, questionForm } = this.state;
    if (!exam) return { ok: false };

    const displayNum = this.getActiveQuestionDisplayNumber();
    const errors = validateQuestionInput(questionForm, `Câu ${displayNum}`);
    if (errors.length > 0) {
      this.setState({ questionFormErrors: errors });
      return { ok: false, errors };
    }

    const cloned = structuredClone(exam);
    const targetSection = editingTarget.section;
    const limit = getSectionLimit(targetSection);
    const targetList =
      targetSection === EDITOR_SECTIONS.SINGLE
        ? cloned.singleQuestions
        : targetSection === EDITOR_SECTIONS.GROUP1
          ? cloned.groups[0].questions
          : cloned.groups[1].questions;

    const cleanQuestion = createEmptyQuestion(displayNum, {
      question: questionForm.question.trim(),
      options: {
        A: questionForm.options.A.trim(),
        B: questionForm.options.B.trim(),
        C: questionForm.options.C.trim(),
        D: questionForm.options.D.trim()
      },
      correctAnswer: questionForm.correctAnswer,
      explanation: questionForm.explanation.trim()
    });

    let savedIndex = editingTarget.index;
    if (savedIndex === null) {
      if (targetList.length >= limit) {
        this.setState({
          questionFormErrors: [`Phần này đã đạt tối đa ${limit} câu hỏi.`]
        });
        return { ok: false };
      }
      targetList.push(cleanQuestion);
      savedIndex = targetList.length - 1;
    } else if (targetList[savedIndex]) {
      targetList[savedIndex] = cleanQuestion;
    }

    const updatedExam = renumberExamQuestions(cloned);
    const updatedList = getSectionQuestions(updatedExam, targetSection);

    if (!addNext) {
      this.setState({
        exam: updatedExam,
        editingTarget: { section: targetSection, index: savedIndex },
        questionForm: {
          question: updatedList[savedIndex].question,
          options: { ...updatedList[savedIndex].options },
          correctAnswer: updatedList[savedIndex].correctAnswer,
          explanation: updatedList[savedIndex].explanation || ''
        },
        questionFormErrors: [],
        examErrors: [],
        statusNotice: `Đã lưu Câu ${displayNum}.`,
        isDirty: true
      });
      return { ok: true };
    }

    // Advance automatically for fast continuous question creation
    if (updatedList.length < limit) {
      this.setState({
        exam: updatedExam,
        activeSection: targetSection,
        editingTarget: { section: targetSection, index: null },
        questionForm: createBlankForm(),
        questionFormErrors: [],
        examErrors: [],
        statusNotice: `Đã thêm Câu ${displayNum}. Tiếp tục nhập Câu ${getSectionStartNumber(targetSection) + updatedList.length}.`,
        isDirty: true
      });
      return { ok: true };
    }

    // Current section just became full -> move to next incomplete section if available
    const summary = getExamCompletionSummary(updatedExam);
    let nextSection = null;
    if (summary.singleCount < SINGLE_SECTION_LIMIT) nextSection = EDITOR_SECTIONS.SINGLE;
    else if (summary.group1Count < GROUP_SECTION_LIMIT) nextSection = EDITOR_SECTIONS.GROUP1;
    else if (summary.group2Count < GROUP_SECTION_LIMIT) nextSection = EDITOR_SECTIONS.GROUP2;

    if (nextSection) {
      this.setState({
        exam: updatedExam,
        activeSection: nextSection,
        editingTarget: { section: nextSection, index: null },
        questionForm: createBlankForm(),
        questionFormErrors: [],
        examErrors: [],
        statusNotice: `Đã hoàn thành đủ câu ở phần trước! Chuyển sang thêm câu cho ${
          nextSection === EDITOR_SECTIONS.GROUP1 ? 'Ngữ liệu đọc hiểu 1' : 'Ngữ liệu đọc hiểu 2'
        }.`,
        isDirty: true
      });
      return { ok: true };
    }

    this.setState({
      exam: updatedExam,
      editingTarget: { section: targetSection, index: savedIndex },
      questionForm: {
        question: updatedList[savedIndex].question,
        options: { ...updatedList[savedIndex].options },
        correctAnswer: updatedList[savedIndex].correctAnswer,
        explanation: updatedList[savedIndex].explanation || ''
      },
      questionFormErrors: [],
      examErrors: [],
      statusNotice: 'Tuyệt vời! Bạn đã hoàn thành đủ 30/30 câu hỏi.',
      isDirty: true
    });
    return { ok: true };
  }

  deleteQuestion(section, index) {
    if (!this.state.exam) return;
    const cloned = structuredClone(this.state.exam);
    const list =
      section === EDITOR_SECTIONS.SINGLE
        ? cloned.singleQuestions
        : section === EDITOR_SECTIONS.GROUP1
          ? cloned.groups[0].questions
          : cloned.groups[1].questions;

    if (index < 0 || index >= list.length) return;
    list.splice(index, 1);

    const updatedExam = renumberExamQuestions(cloned);
    const nextList = getSectionQuestions(updatedExam, section);

    if (nextList.length > 0) {
      const nextIdx = Math.min(index, nextList.length - 1);
      const q = nextList[nextIdx];
      this.setState({
        exam: updatedExam,
        activeSection: section,
        editingTarget: { section, index: nextIdx },
        questionForm: {
          question: q.question,
          options: { ...q.options },
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || ''
        },
        questionFormErrors: [],
        statusNotice: 'Đã xóa câu hỏi và đánh số lại.',
        isDirty: true
      });
    } else {
      this.setState({
        exam: updatedExam,
        activeSection: section,
        editingTarget: { section, index: null },
        questionForm: createBlankForm(),
        questionFormErrors: [],
        statusNotice: 'Đã xóa câu hỏi.',
        isDirty: true
      });
    }
  }

  moveQuestion(section, index, direction) {
    if (!this.state.exam) return;
    const targetIdx = index + direction;
    const cloned = structuredClone(this.state.exam);
    const list =
      section === EDITOR_SECTIONS.SINGLE
        ? cloned.singleQuestions
        : section === EDITOR_SECTIONS.GROUP1
          ? cloned.groups[0].questions
          : cloned.groups[1].questions;

    if (index < 0 || targetIdx < 0 || index >= list.length || targetIdx >= list.length) return;
    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);

    const updatedExam = renumberExamQuestions(cloned);
    const updatedList = getSectionQuestions(updatedExam, section);
    const currentQ = updatedList[targetIdx];

    this.setState({
      exam: updatedExam,
      activeSection: section,
      editingTarget: { section, index: targetIdx },
      questionForm: {
        question: currentQ.question,
        options: { ...currentQ.options },
        correctAnswer: currentQ.correctAnswer,
        explanation: currentQ.explanation || ''
      },
      isDirty: true
    });
  }

  fillMissingSamples() {
    if (!this.state.exam) return;
    const cloned = structuredClone(this.state.exam);
    if (!cloned.title.trim()) {
      cloned.title = `Bài tập Tiếng Việt mới (${new Date().toLocaleDateString('vi-VN')})`;
    }

    for (let i = cloned.singleQuestions.length; i < SINGLE_SECTION_LIMIT; i += 1) {
      const num = i + 1;
      cloned.singleQuestions.push(
        createEmptyQuestion(num, {
          question: `Câu hỏi mẫu số ${num} (hãy sửa nội dung này)`,
          options: {
            A: `Phương án A của câu ${num}`,
            B: `Phương án B của câu ${num}`,
            C: `Phương án C của câu ${num}`,
            D: `Phương án D của câu ${num}`
          },
          correctAnswer: OPTION_KEYS[i % 4]
        })
      );
    }

    cloned.groups.forEach((g, gIdx) => {
      const start = gIdx === 0 ? 21 : 26;
      if (!g.passageTitle.trim()) g.passageTitle = `Đoạn đọc hiểu mẫu ${gIdx + 1}`;
      if (!g.passage.trim()) {
        g.passage = `Đây là đoạn ngữ liệu đọc hiểu mẫu cho nhóm câu ${start}–${start + 4}. Giáo viên hãy thay thế bằng đoạn văn bản thực tế.`;
      }
      for (let qIdx = g.questions.length; qIdx < GROUP_SECTION_LIMIT; qIdx += 1) {
        const num = start + qIdx;
        g.questions.push(
          createEmptyQuestion(num, {
            question: `Câu hỏi đọc hiểu số ${num} (hãy sửa nội dung này)`,
            options: {
              A: `Phương án A của câu ${num}`,
              B: `Phương án B của câu ${num}`,
              C: `Phương án C của câu ${num}`,
              D: `Phương án D của câu ${num}`
            },
            correctAnswer: OPTION_KEYS[qIdx % 4]
          })
        );
      }
    });

    const updatedExam = renumberExamQuestions(cloned);
    const activeList = getSectionQuestions(updatedExam, this.state.activeSection);
    const first = activeList[0];
    this.setState({
      exam: updatedExam,
      editingTarget: { section: this.state.activeSection, index: first ? 0 : null },
      questionForm: first
        ? {
            question: first.question,
            options: { ...first.options },
            correctAnswer: first.correctAnswer,
            explanation: first.explanation || ''
          }
        : createBlankForm(),
      statusNotice: 'Đã điền mẫu cho các câu còn thiếu đủ 30 câu.',
      isDirty: true
    });
  }

  openQuickImport() {
    this.setState({ quickImportOpen: true });
  }

  closeQuickImport() {
    this.setState({ quickImportOpen: false });
  }

  setQuickImportText(quickImportText) {
    this.setState({ quickImportText });
  }

  insertQuickSample() {
    const patch = { quickImportText: buildQuickSampleText30() };
    if (this.state.exam && !this.state.exam.title.trim()) {
      patch.exam = {
        ...this.state.exam,
        title: `Bài tập Tiếng Việt nhập nhanh (${new Date().toLocaleDateString('vi-VN')})`
      };
    }
    this.setState(patch);
  }

  applyQuickImport() {
    if (!this.state.exam) return 0;
    const { exam, updatedCount } = parseQuickText(this.state.quickImportText, this.state.exam);
    const list = getSectionQuestions(exam, this.state.activeSection);
    const idx = list.length > 0 ? 0 : null;
    const form =
      idx !== null
        ? {
            question: list[0].question,
            options: { ...list[0].options },
            correctAnswer: list[0].correctAnswer,
            explanation: list[0].explanation || ''
          }
        : createBlankForm();

    this.setState({
      exam,
      editingTarget: { section: this.state.activeSection, index: idx },
      questionForm: form,
      quickImportOpen: false,
      statusNotice: `Đã nhận diện và điền tự động ${updatedCount} câu hỏi vào bài tập.`,
      isDirty: true
    });
    return updatedCount;
  }

  importFromJsonText(rawJson) {
    const parsed = JSON.parse(rawJson);
    const imported = normalizeExam({
      ...createEmptyExamTemplate({ prefillQuestions: false, isPublished: false }),
      ...parsed,
      id: generateId('exam'),
      createdAt: new Date().toISOString()
    });
    this.openExisting(imported);
    this.setState({ isNew: true, isDirty: true, statusNotice: 'Đã nhập bài tập từ file JSON.' });
  }

  async saveExam({ publishOverride = null } = {}) {
    if (!this.state.exam) return { ok: false, errors: ['Chưa mở bài tập.'] };

    // Auto-commit active question form if user is editing an existing question or typed data in new form
    if (this.state.editingTarget.index !== null || hasAnyFormInput(this.state.questionForm)) {
      const commitRes = this.commitCurrentQuestion({ addNext: false });
      if (!commitRes.ok) {
        return { ok: false, errors: commitRes.errors || ['Vui lòng hoàn thiện câu hỏi đang nhập.'] };
      }
    }

    const candidate = structuredClone(this.state.exam);
    if (publishOverride !== null) {
      candidate.isPublished = publishOverride;
    }

    const errors = validateExam(candidate, { strict30: candidate.isPublished !== false });
    if (errors.length > 0) {
      this.setState({ examErrors: errors });
      return { ok: false, errors };
    }

    this.setState({ isSaving: true, examErrors: [] });
    try {
      const saved = await this.repository.saveExam(candidate);
      this.setState({ isSaving: false, isDirty: false });
      return { ok: true, exam: saved };
    } catch (err) {
      const msg = err.message || 'Không thể lưu bài tập.';
      this.setState({ isSaving: false, examErrors: [msg] });
      return { ok: false, errors: [msg] };
    }
  }
}
