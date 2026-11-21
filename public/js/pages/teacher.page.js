import { TeacherAuthViewModel } from '../viewmodels/teacher-auth.viewmodel.js';
import { TeacherEditorViewModel } from '../viewmodels/teacher-editor.viewmodel.js';
import { TeacherExamsViewModel } from '../viewmodels/teacher-exams.viewmodel.js';
import { TeacherScoresViewModel } from '../viewmodels/teacher-scores.viewmodel.js';
import { TeacherSettingsViewModel } from '../viewmodels/teacher-settings.viewmodel.js';
import { TeacherEditorView } from '../views/teacher-editor.view.js';
import { TeacherView } from '../views/teacher.view.js';

const authVm = new TeacherAuthViewModel();
const examsVm = new TeacherExamsViewModel();
const editorVm = new TeacherEditorViewModel();
const scoresVm = new TeacherScoresViewModel();
const settingsVm = new TeacherSettingsViewModel();

const teacherView = new TeacherView({
  authVm,
  examsVm,
  editorVm,
  scoresVm,
  settingsVm
});

const editorView = new TeacherEditorView(editorVm, {
  onSaved: async () => {
    await examsVm.loadExams();
  },
  onCancel: () => {}
});

teacherView.mount();
editorView.mount();

authVm.init().then(async (unlocked) => {
  if (unlocked) {
    await teacherView.onUnlocked();
  }
});
