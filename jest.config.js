module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '.wav$': '<rootDir>/__mocks__/asset.js',
  },
};
