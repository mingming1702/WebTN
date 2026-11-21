import { HomeViewModel } from '../viewmodels/home.viewmodel.js';
import { HomeView } from '../views/home.view.js';

const vm = new HomeViewModel();
const view = new HomeView(vm);
view.mount();
vm.init();
