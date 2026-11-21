import { generateId } from '../core/id.js';
import { BaseViewModel } from '../core/observable.js';
import { defaultRepository } from '../models/storage.repository.js';

export class TeacherExamsViewModel extends BaseViewModel {
  constructor(repository = defaultRepository) {
    super({
      loading: false,
      exams: [],
      error: '',
      copiedNotice: null // { examId, mode }
    });
    this.repository = repository;
  }

  async loadExams() {
    this.setState({ loading: true, error: '' });
    try {
      const exams = await this.repository.listExams({ includeUnpublished: true });
      this.setState({ loading: false, exams });
      return exams;
    } catch (err) {
      this.setState({ loading: false, error: err.message });
      return [];
    }
  }

  async togglePublish(examId) {
    const exam = this.state.exams.find((e) => e.id === examId);
    if (!exam) return { ok: false, error: 'Không tìm thấy bài tập.' };
    await this.repository.saveExam({
      ...exam,
      isPublished: exam.isPublished === false
    });
    await this.loadExams();
    return { ok: true };
  }

  async duplicateExam(examId) {
    const exam = this.state.exams.find((e) => e.id === examId);
    if (!exam) return null;
    const now = new Date().toISOString();
    const copy = {
      ...structuredClone(exam),
      id: generateId('exam'),
      title: `${exam.title} (Bản sao)`,
      isPublished: false,
      createdAt: now,
      updatedAt: now
    };
    await this.repository.saveExam(copy);
    await this.loadExams();
    return copy;
  }

  async deleteExam(examId) {
    await this.repository.deleteExam(examId);
    await this.loadExams();
  }

  buildShareUrl(examId, origin, mode = 'practice') {
    const params = new URLSearchParams({ id: examId, mode });
    return `${origin}/exam?${params.toString()}`;
  }

  markCopied(examId, mode) {
    this.setState({ copiedNotice: { examId, mode } });
  }

  clearCopied() {
    this.setState({ copiedNotice: null });
  }
}
