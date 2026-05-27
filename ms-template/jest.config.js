module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 55,
      lines: 70,
      statements: 70,
    },
  },
};
