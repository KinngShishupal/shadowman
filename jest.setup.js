/* eslint-env jest */
// Native audio isn't available under Jest.
jest.mock('react-native-sound', () => {
  class Sound {
    static setCategory() {}
    constructor(_uri, _base, cb) {
      cb && cb(null);
    }
    isLoaded() {
      return true;
    }
    play() {
      return this;
    }
    pause() {
      return this;
    }
    stop(cb) {
      cb && cb();
      return this;
    }
    release() {
      return this;
    }
    setVolume() {
      return this;
    }
    setNumberOfLoops() {
      return this;
    }
  }
  return Sound;
});

// AsyncStorage ships ES modules; a simple in-memory stand-in is enough here.
jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(key => Promise.resolve(store.get(key) ?? null)),
      setItem: jest.fn((key, value) => {
        store.set(key, value);
        return Promise.resolve();
      }),
    },
  };
});
