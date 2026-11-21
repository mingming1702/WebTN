import { formatDateTime } from '../core/formatters.js';
import { BaseViewModel } from '../core/observable.js';
import { SCORE_SCALE, computeSubmissionStats, computeTopWrongQuestions } from '../models/grading.model.js';
import { defaultRepository } from '../models/storage.repository.js';

export class TeacherScoresViewModel extends BaseViewModel {
  constructor(repository = defaultRepository) {
    super({
      loading: false,
      submissions: [],
      filterExamId: '',
      searchQuery: '',
      detailModal: {
        open: false,
        submission: null,
        exam: null
      }
    });
    this.repository = repository;
  }

  async loadScores() {
    this.setState({ loading: true });
    try {
      const submissions = await this.repository.listSubmissions();
      this.setState({ loading: false, submissions });
    } catch {
      this.setState({ loading: false });
    }
  }

  setFilterExamId(filterExamId) {
    this.setState({ filterExamId: String(filterExamId || '') });
  }

  setSearchQuery(searchQuery) {
    this.setState({ searchQuery: String(searchQuery || '') });
  }

  getFilteredSubmissions() {
    const { submissions, filterExamId, searchQuery } = this.state;
    const keyword = searchQuery.trim().toLowerCase();

    return submissions.filter((s) => {
      if (filterExamId && s.examId !== filterExamId) return false;
      if (
        keyword &&
        !String(s.studentName || '').toLowerCase().includes(keyword) &&
        !String(s.studentClass || '').toLowerCase().includes(keyword)
      ) {
        return false;
      }
      return true;
    });
  }

  getDashboardAnalytics(exams = []) {
    const filtered = this.getFilteredSubmissions();
    return {
      stats: computeSubmissionStats(filtered),
      topWrong: computeTopWrongQuestions(filtered, exams, 4)
    };
  }

  getGroupedSubmissions(exams = []) {
    const filtered = this.getFilteredSubmissions();
    const grouped = new Map();
    exams.forEach((exam) => {
      grouped.set(exam.id, { examId: exam.id, examTitle: exam.title, items: [] });
    });
    filtered.forEach((s) => {
      const key = s.examId || s.examTitle;
      if (!grouped.has(key)) {
        grouped.set(key, { examId: key, examTitle: s.examTitle, items: [] });
      }
      grouped.get(key).items.push(s);
    });
    return Array.from(grouped.values()).filter((g) => g.items.length > 0);
  }

  async openDetail(subId) {
    const submission = this.state.submissions.find((s) => s.id === subId);
    if (!submission) return;
    const exam = await this.repository.getExamById(submission.examId);
    this.setState({
      detailModal: {
        open: true,
        submission,
        exam
      }
    });
  }

  closeDetail() {
    this.setState({
      detailModal: { open: false, submission: null, exam: null }
    });
  }

  async deleteSubmission(subId) {
    await this.repository.deleteSubmission(subId);
    await this.loadScores();
  }

  buildCsvContent() {
    const list = this.getFilteredSubmissions();
    if (!list.length) return '';

    const sorted = [...list].sort(
      (a, b) =>
        (a.examTitle || '').localeCompare(b.examTitle || '', 'vi') ||
        new Date(b.submittedAt) - new Date(a.submittedAt)
    );
    const csvCell = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const headers = [
      'Bài tập / Đề thi',
      'Họ và tên',
      'Số câu đúng',
      'Tổng số câu',
      `Điểm (/${SCORE_SCALE})`,
      'Thời gian làm (giây)',
      'Thời điểm nộp'
    ];
    const rows = sorted.map((s) =>
      [
        s.examTitle,
        s.studentName,
        s.correctCount,
        s.totalQuestions,
        s.score,
        s.elapsedSeconds,
        formatDateTime(s.submittedAt)
      ]
        .map(csvCell)
        .join(',')
    );

    return '\uFEFF' + [headers.map(csvCell).join(','), ...rows].join('\n');
  }
}
