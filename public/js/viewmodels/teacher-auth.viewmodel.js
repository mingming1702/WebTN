import { BaseViewModel } from '../core/observable.js';
import { defaultRepository } from '../models/storage.repository.js';

export class TeacherAuthViewModel extends BaseViewModel {
  constructor(repository = defaultRepository) {
    super({
      unlocked: false,
      pinError: '',
      storageMode: { mode: 'local', source: 'localstorage' }
    });
    this.repository = repository;
  }

  async init() {
    const unlocked = this.repository.isTeacherSessionUnlocked();
    this.setState({ unlocked });
    await this.refreshStorageMode();
    return unlocked;
  }

  async refreshStorageMode() {
    const storageMode = await this.repository.getStorageMode();
    this.setState({ storageMode });
    return storageMode;
  }

  verifyPin(rawPin) {
    const entered = String(rawPin || '').trim();
    const expected = this.repository.getTeacherPin();
    if (entered && entered === expected) {
      this.repository.setTeacherSessionUnlocked(true);
      this.setState({ unlocked: true, pinError: '' });
      return true;
    }
    this.setState({ pinError: 'Mã PIN chưa đúng. Vui lòng thử lại.' });
    return false;
  }

  lock() {
    this.repository.setTeacherSessionUnlocked(false);
    this.setState({ unlocked: false, pinError: '' });
  }
}
