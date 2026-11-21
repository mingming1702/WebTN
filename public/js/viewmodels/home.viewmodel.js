import { BaseViewModel } from '../core/observable.js';
import { EXAM_MODES, flattenExamQuestions } from '../models/exam.model.js';
import { defaultRepository } from '../models/storage.repository.js';

export class HomeViewModel extends BaseViewModel {
  constructor(repository = defaultRepository) {
    super({
      loading: true,
      error: '',
      exams: [],
      submissions: [],
      searchQuery: '',
      statusFilter: 'all', // 'all' | 'todo' | 'done'
      historyScope: 'mine',
      lastStudentName: '',
      startModal: {
        open: false,
        exam: null,
        studentName: '',
        mode: EXAM_MODES.PRACTICE
      }
    });
    this.repository = repository;
  }

  async init() {
    const lastStudentName = this.repository.getLastStudentName();
    this.setState({
      loading: true,
      error: '',
      lastStudentName,
      historyScope: 'mine'
    });

    try {
      const [exams, submissions] = await Promise.all([
        this.repository.listExams({ includeUnpublished: false }),
        this.repository.listMySubmissions()
      ]);
      this.setState({
        loading: false,
        exams,
        submissions
      });
    } catch (err) {
      this.setState({
        loading: false,
        error: err.message || 'Không thể tải danh sách bài tập.'
      });
    }
  }

  setSearchQuery(searchQuery) {
    this.setState({ searchQuery: String(searchQuery || '') });
  }

  setStatusFilter(statusFilter) {
    this.setState({ statusFilter });
  }

  setHistoryScope() {
    this.setState({ historyScope: 'mine' });
  }

  getPersonalSubmissions() {
    return this.state.submissions;
  }

  getExamAttemptMap() {
    const map = new Map();
    this.state.submissions.forEach((sub) => {
      if (!map.has(sub.examId)) {
        map.set(sub.examId, { count: 0, latest: sub, bestScore: sub.score });
      }
      const entry = map.get(sub.examId);
      entry.count += 1;
      if (Number(sub.score) > Number(entry.bestScore)) {
        entry.bestScore = sub.score;
      }
    });
    return map;
  }

  getFilteredExams() {
    const { exams, searchQuery, statusFilter } = this.state;
    const q = searchQuery.trim().toLowerCase();
    const attemptMap = this.getExamAttemptMap();

    return exams
      .map((exam) => ({
        exam,
        totalQuestions: flattenExamQuestions(exam).length,
        attempt: attemptMap.get(exam.id) || null
      }))
      .filter(({ exam, attempt }) => {
        if (q) {
          const matchesTitle = exam.title.toLowerCase().includes(q);
          const matchesDesc = (exam.description || '').toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc) return false;
        }
        if (statusFilter === 'done' && !attempt) return false;
        if (statusFilter === 'todo' && attempt) return false;
        return true;
      });
  }

  getGroupedHistory() {
    const list = this.getPersonalSubmissions();
    const grouped = new Map();
    list.forEach((sub) => {
      const key = sub.examId || sub.examTitle;
      if (!grouped.has(key)) {
        grouped.set(key, { examId: sub.examId, examTitle: sub.examTitle, items: [] });
      }
      grouped.get(key).items.push(sub);
    });
    return Array.from(grouped.values());
  }

  getDashboardStats() {
    const { exams, submissions } = this.state;
    const attemptMap = this.getExamAttemptMap();
    const personalSubs = this.getPersonalSubmissions();
    const bestScore = personalSubs.length
      ? Math.max(...personalSubs.map((s) => Number(s.score || 0)))
      : null;

    return {
      openExamsCount: exams.length,
      completedExamsCount: attemptMap.size,
      totalAttempts: personalSubs.length,
      allSubmissionsCount: submissions.length,
      bestScore
    };
  }

  openStartModal(examId, mode = EXAM_MODES.PRACTICE) {
    const exam = this.state.exams.find((e) => e.id === examId);
    if (!exam) return;
    this.setState({
      startModal: {
        open: true,
        exam,
        studentName: this.repository.getLastStudentName(),
        mode: mode === EXAM_MODES.TIMED ? EXAM_MODES.TIMED : EXAM_MODES.PRACTICE
      }
    });
  }

  closeStartModal() {
    this.setState({
      startModal: {
        ...this.state.startModal,
        open: false
      }
    });
  }

  setModalStudentName(studentName) {
    this.setState({
      startModal: {
        ...this.state.startModal,
        studentName
      }
    });
  }

  setModalMode(mode) {
    this.setState({
      startModal: {
        ...this.state.startModal,
        mode: mode === EXAM_MODES.TIMED ? EXAM_MODES.TIMED : EXAM_MODES.PRACTICE
      }
    });
  }

  buildStartUrl() {
    const { exam, studentName, mode } = this.state.startModal;
    const trimmed = String(studentName || '').trim();
    if (!exam || !trimmed) return '';

    this.repository.setLastStudentName(trimmed);
    this.setState({ lastStudentName: trimmed });

    const params = new URLSearchParams({
      id: exam.id,
      name: trimmed,
      mode
    });
    return `/exam?${params.toString()}`;
  }
}
