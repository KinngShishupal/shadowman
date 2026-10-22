module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // Game sprites are positioned per frame, so inline styles are intentional.
    'react-native/no-inline-styles': 'off',
  },
};
