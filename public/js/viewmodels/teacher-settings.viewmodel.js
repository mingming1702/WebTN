import { BaseViewModel } from '../core/observable.js';
import { defaultRepository } from '../models/storage.repository.js';

export class TeacherSettingsViewModel extends BaseViewModel {
  constructor(repository = defaultRepository) {
    super({
      supabaseUrl: '',
      supabaseAnonKey: '',
      cloudMessage: null, // { type: 'green' | 'blue' | 'amber', text: string }
      pinMessage: null,
      resetMessage: null
    });
    this.repository = repository;
  }

  loadConfig() {
    const cfg = this.repository.getLocalCloudConfig();
    this.setState({
      supabaseUrl: cfg.supabaseUrl || '',
      supabaseAnonKey: cfg.supabaseAnonKey || ''
    });
  }

  saveCloudConfig(url, key) {
    this.repository.setLocalCloudConfig({ supabaseUrl: url, supabaseAnonKey: key });
    this.setState({
      supabaseUrl: url.trim(),
      supabaseAnonKey: key.trim(),
      cloudMessage: { type: 'green', text: 'Đã lưu cấu hình Supabase và làm mới dữ liệu!' }
    });
  }

  disconnectCloud() {
    this.repository.setLocalCloudConfig({ supabaseUrl: '', supabaseAnonKey: '' });
    this.setState({
      supabaseUrl: '',
      supabaseAnonKey: '',
      cloudMessage: { type: 'blue', text: 'Đã chuyển về chế độ lưu cục bộ (LocalStorage).' }
    });
  }

  updatePin(newPin) {
    const trimmed = String(newPin || '').trim();
    if (trimmed.length < 4) {
      this.setState({
        pinMessage: { type: 'amber', text: 'Mã PIN phải có ít nhất 4 ký tự.' }
      });
      return false;
    }
    this.repository.setTeacherPin(trimmed);
    this.setState({
      pinMessage: { type: 'green', text: 'Đã đổi mã PIN giáo viên thành công!' }
    });
    return true;
  }

  async resetDemoData() {
    await this.repository.resetDemoData();
    this.setState({
      resetMessage: { type: 'green', text: 'Đã khôi phục dữ liệu mẫu Đề 11 – Đề 15 thành công!' }
    });
  }
}
