export class ObservableStore {
  constructor(initialState = {}) {
    this._state = { ...initialState };
    this._listeners = new Set();
  }

  getState() {
    return this._state;
  }

  setState(updater) {
    const prevState = this._state;
    const patch = typeof updater === 'function' ? updater(prevState) : updater;
    if (!patch || typeof patch !== 'object') return;

    const nextState = { ...prevState, ...patch };
    this._state = nextState;

    for (const listener of this._listeners) {
      listener(nextState, prevState);
    }
  }

  subscribe(listener, immediate = false) {
    this._listeners.add(listener);
    if (immediate) {
      listener(this._state, this._state);
    }
    return () => {
      this._listeners.delete(listener);
    };
  }

  clearListeners() {
    this._listeners.clear();
  }
}

export class BaseViewModel {
  constructor(initialState = {}) {
    this.store = new ObservableStore(initialState);
  }

  get state() {
    return this.store.getState();
  }

  setState(updater) {
    this.store.setState(updater);
  }

  subscribe(listener, immediate = false) {
    return this.store.subscribe(listener, immediate);
  }

  dispose() {
    this.store.clearListeners();
  }
}
