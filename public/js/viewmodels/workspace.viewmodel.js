import { generateId } from '../core/id.js';
import { BaseViewModel } from '../core/observable.js';
import { EXAM_MODES, OPTION_KEYS, flattenExamQuestions } from '../models/exam.model.js';
import { gradeExam } from '../models/grading.model.js';
import { defaultRepository } from '../models/storage.repository.js';

export class WorkspaceViewModel extends BaseViewModel {
  constructor(repository = defaultRepository, nowProvider = () => Date.now()) {
    super({
      phase: 'loading', // 'loading' | 'error' | 'gate' | 'active' | 'submitted'
      errorMessage: '',
      exam: null,
      mode: EXAM_MODES.PRACTICE,
      isReviewOnly: false,
      studentName: '',
      studentClass: '',
      gateDefaultName: '',
      gateDefaultMode: EXAM_MODES.PRACTICE,
      answers: {},
      flaggedNumbers: [],
      checkedNumbers: [],
      startedAt: 0,
      endsAt: null,
      elapsedSeconds: 0,
      remainingSeconds: 40 * 60,
      totalDurationSeconds: 40 * 60,
      activeSectionTab: 'all',
      activeReviewFilter: 'all',
      passageFontSize: 15.5,
      confirmModalOpen: false,
      isAutoTimeUp: false,
      submissionRecord: null,
      submissionResult: null,
      saveStatus: { ok: true, message: '' }
    });

    this.repository = repository;
    this.nowProvider = nowProvider;
    this._timerHandle = null;
    this._lastDraftSaveSec = -1;
  }

  async init({ examId, reviewSubId = '', studentName = '', studentClass = '', mode = '' }) {
    this.stopTimerLoop();

    if (!examId) {
      this.setState({
        phase: 'error',
        errorMessage: 'Đường dẫn chưa có mã bài tập. Vui lòng chọn bài từ trang chủ.'
      });
      return;
    }

    const resolvedMode = mode === EXAM_MODES.TIMED ? EXAM_MODES.TIMED : EXAM_MODES.PRACTICE;

    try {
      const exam = await this.repository.getExamById(examId);
      if (!exam) {
        this.setState({
          phase: 'error',
          errorMessage: 'Bài tập không tồn tại hoặc đã bị giáo viên xóa.'
        });
        return;
      }

      if (reviewSubId) {
        const sub = await this.repository.getSubmissionById(reviewSubId);
        if (!sub) {
          this.setState({
            phase: 'error',
            errorMessage: 'Không tìm thấy lịch sử bài làm này.'
          });
          return;
        }
        this._enterSavedReview(exam, sub);
        return;
      }

      const trimmedName = String(studentName || '').trim();
      const trimmedClass = String(studentClass || '').trim();

      if (trimmedName) {
        this.beginSession({
          exam,
          studentName: trimmedName,
          studentClass: trimmedClass,
          mode: resolvedMode
        });
      } else {
        this.setState({
          phase: 'gate',
          exam,
          mode: resolvedMode,
          gateDefaultName: this.repository.getLastStudentName(),
          gateDefaultMode: resolvedMode
        });
      }
    } catch (err) {
      this.setState({
        phase: 'error',
        errorMessage: `Không thể tải bài tập: ${err.message}`
      });
    }
  }

  startFromGate({ studentName, mode }) {
    const trimmed = String(studentName || '').trim();
    if (!trimmed || !this.state.exam) return;
    this.repository.setLastStudentName(trimmed);
    this.beginSession({
      exam: this.state.exam,
      studentName: trimmed,
      studentClass: this.state.studentClass,
      mode: mode === EXAM_MODES.TIMED ? EXAM_MODES.TIMED : EXAM_MODES.PRACTICE
    });
  }

  beginSession({ exam, studentName, studentClass = '', mode = EXAM_MODES.PRACTICE }) {
    const now = this.nowProvider();
    const totalDurationSeconds = (Number(exam.durationMinutes) || 40) * 60;
    const draft = this.repository.loadExamDraft(exam.id);

    const canRestoreDraft =
      draft &&
      draft.studentName === studentName &&
      (draft.studentClass || '') === (studentClass || '') &&
      (draft.mode || EXAM_MODES.PRACTICE) === mode &&
      (mode === EXAM_MODES.PRACTICE || (typeof draft.endsAt === 'number' && draft.endsAt > now));

    let answers = {};
    let flaggedNumbers = [];
    let checkedNumbers = [];
    let startedAt = now;
    let endsAt = mode === EXAM_MODES.TIMED ? now + totalDurationSeconds * 1000 : null;

    if (canRestoreDraft) {
      answers = { ...(draft.answers || {}) };
      flaggedNumbers = Array.isArray(draft.flagged) ? draft.flagged : [];
      checkedNumbers = Array.isArray(draft.checked) ? draft.checked : [];
      startedAt = typeof draft.startedAt === 'number' ? draft.startedAt : now;
      if (mode === EXAM_MODES.TIMED) {
        endsAt = draft.endsAt;
      }
    }

    const elapsedSeconds = Math.max(0, Math.floor((now - startedAt) / 1000));
    const remainingSeconds =
      mode === EXAM_MODES.TIMED && endsAt !== null
        ? Math.max(0, Math.ceil((endsAt - now) / 1000))
        : totalDurationSeconds;

    this.setState({
      phase: 'active',
      isReviewOnly: false,
      exam,
      mode,
      studentName,
      studentClass,
      answers,
      flaggedNumbers,
      checkedNumbers,
      startedAt,
      endsAt,
      elapsedSeconds,
      remainingSeconds,
      totalDurationSeconds,
      activeSectionTab: 'all',
      activeReviewFilter: 'all',
      confirmModalOpen: false,
      isAutoTimeUp: false,
      submissionRecord: null,
      submissionResult: null
    });

    this.persistDraft();
    this.startTimerLoop();
  }

  _enterSavedReview(exam, sub) {
    const answers = { ...(sub.answers || {}) };
    const computed = gradeExam(exam, answers);
    // Preserve recorded submission score/counts so later edits by teacher do not retroactively change past score
    const submissionResult = {
      ...computed,
      score: Number(sub.score ?? computed.score),
      correctCount: Number(sub.correctCount ?? computed.correctCount),
      totalQuestions: Number(sub.totalQuestions ?? computed.totalQuestions)
    };

    this.setState({
      phase: 'submitted',
      isReviewOnly: true,
      exam,
      studentName: sub.studentName,
      studentClass: sub.studentClass || '',
      answers,
      flaggedNumbers: [],
      checkedNumbers: [],
      elapsedSeconds: Number(sub.elapsedSeconds || 0),
      activeSectionTab: 'all',
      activeReviewFilter: 'all',
      submissionRecord: sub,
      submissionResult,
      saveStatus: { ok: true, message: 'Chế độ xem lại bài đã nộp' }
    });
  }

  persistDraft() {
    const { phase, exam, mode, studentName, studentClass, answers, flaggedNumbers, checkedNumbers, startedAt, endsAt } =
      this.state;
    if (phase !== 'active' || !exam) return;

    this.repository.saveExamDraft(exam.id, {
      mode,
      studentName,
      studentClass,
      answers,
      flagged: flaggedNumbers,
      checked: checkedNumbers,
      startedAt,
      endsAt,
      savedAt: this.nowProvider()
    });
  }

  startTimerLoop() {
    this.stopTimerLoop();
    if (typeof setInterval === 'undefined') return;
    this._timerHandle = setInterval(() => {
      this.tick(this.nowProvider());
    }, 1000);
  }

  stopTimerLoop() {
    if (this._timerHandle !== null) {
      clearInterval(this._timerHandle);
      this._timerHandle = null;
    }
  }

  tick(nowMs = this.nowProvider()) {
    const { phase, mode, startedAt, endsAt } = this.state;
    if (phase !== 'active') {
      this.stopTimerLoop();
      return;
    }

    const elapsedSeconds = Math.max(0, Math.floor((nowMs - startedAt) / 1000));
    let remainingSeconds = this.state.remainingSeconds;

    if (mode === EXAM_MODES.TIMED && endsAt !== null) {
      remainingSeconds = Math.max(0, Math.ceil((endsAt - nowMs) / 1000));
    }

    this.setState({ elapsedSeconds, remainingSeconds });

    if (elapsedSeconds - this._lastDraftSaveSec >= 5) {
      this._lastDraftSaveSec = elapsedSeconds;
      this.persistDraft();
    }

    if (mode === EXAM_MODES.TIMED && remainingSeconds <= 0) {
      this.stopTimerLoop();
      this.submit({ isAutoTimeUp: true, nowMs });
    }
  }

  selectAnswer(qNumber, optionKey) {
    if (this.state.phase !== 'active') return;
    if (!OPTION_KEYS.includes(optionKey)) return;
    if (this.state.checkedNumbers.includes(Number(qNumber))) return;

    const answers = { ...this.state.answers, [String(qNumber)]: optionKey };
    this.setState({ answers });
    this.persistDraft();
  }

  checkQuestionNow(qNumber) {
    const { phase, mode, answers, checkedNumbers } = this.state;
    if (phase !== 'active' || mode !== EXAM_MODES.PRACTICE) return;
    const num = Number(qNumber);
    if (!OPTION_KEYS.includes(answers[String(num)])) return;
    if (checkedNumbers.includes(num)) return;

    this.setState({ checkedNumbers: [...checkedNumbers, num] });
    this.persistDraft();
  }

  toggleFlag(qNumber) {
    if (this.state.phase !== 'active') return;
    const num = Number(qNumber);
    const exists = this.state.flaggedNumbers.includes(num);
    const flaggedNumbers = exists
      ? this.state.flaggedNumbers.filter((n) => n !== num)
      : [...this.state.flaggedNumbers, num];
    this.setState({ flaggedNumbers });
    this.persistDraft();
  }

  setSectionTab(activeSectionTab) {
    this.setState({ activeSectionTab });
  }

  setReviewFilter(activeReviewFilter) {
    this.setState({ activeReviewFilter });
  }

  jumpToQuestion(qNumber) {
    const patch = {};
    if (this.state.activeSectionTab !== 'all') {
      patch.activeSectionTab = 'all';
    }
    if (this.state.phase === 'submitted' && this.state.activeReviewFilter !== 'all') {
      patch.activeReviewFilter = 'all';
    }
    if (Object.keys(patch).length > 0) {
      this.setState(patch);
    }
    return Number(qNumber);
  }

  adjustPassageFontSize(delta) {
    const next = Math.min(20, Math.max(13.5, Number((this.state.passageFontSize + delta).toFixed(1))));
    this.setState({ passageFontSize: next });
  }

  openConfirmModal() {
    if (this.state.phase !== 'active') return;
    this.setState({ confirmModalOpen: true });
  }

  closeConfirmModal() {
    this.setState({ confirmModalOpen: false });
  }

  getAnsweredCount() {
    return Object.values(this.state.answers).filter((v) => OPTION_KEYS.includes(v)).length;
  }

  getTotalQuestions() {
    return flattenExamQuestions(this.state.exam).length || 30;
  }

  async submit({ isAutoTimeUp = false, nowMs = this.nowProvider() } = {}) {
    if (this.state.phase !== 'active' || !this.state.exam) return;
    this.stopTimerLoop();

    const { exam, studentName, studentClass, answers, startedAt } = this.state;
    const elapsedSeconds = Math.max(1, Math.floor((nowMs - startedAt) / 1000));
    const submissionResult = gradeExam(exam, answers);

    const submissionRecord = {
      id: generateId('sub'),
      examId: exam.id,
      examTitle: exam.title,
      studentName,
      studentClass,
      correctCount: submissionResult.correctCount,
      totalQuestions: submissionResult.totalQuestions,
      score: submissionResult.score,
      elapsedSeconds,
      answers: { ...answers },
      submittedAt: new Date(nowMs).toISOString()
    };

    let saveStatus = { ok: true, message: 'Đã ghi nhận kết quả cho giáo viên' };
    try {
      await this.repository.saveSubmission(submissionRecord);
      this.repository.clearExamDraft(exam.id);
    } catch (err) {
      saveStatus = { ok: false, message: `Lưu kết quả lỗi: ${err.message}` };
    }

    this.setState({
      phase: 'submitted',
      confirmModalOpen: false,
      isAutoTimeUp,
      elapsedSeconds,
      submissionRecord,
      submissionResult,
      saveStatus
    });
  }

  buildRetakeUrl() {
    const { exam, studentName, studentClass, mode } = this.state;
    if (!exam) return '/';
    this.repository.clearExamDraft(exam.id);
    const params = new URLSearchParams({
      id: exam.id,
      name: studentName,
      mode
    });
    if (studentClass) params.set('class', studentClass);
    return `/exam?${params.toString()}`;
  }

  dispose() {
    this.stopTimerLoop();
    super.dispose();
  }
}
