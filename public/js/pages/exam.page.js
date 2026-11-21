import { WorkspaceViewModel } from '../viewmodels/workspace.viewmodel.js';
import { WorkspaceView } from '../views/workspace.view.js';

const params = new URLSearchParams(window.location.search);
const vm = new WorkspaceViewModel();
const view = new WorkspaceView(vm);
view.mount();

vm.init({
  examId: params.get('id') || '',
  reviewSubId: params.get('review') || '',
  studentName: params.get('name') || '',
  studentClass: params.get('class') || '',
  mode: params.get('mode') || 'practice'
});
