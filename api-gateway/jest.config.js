module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  setupFiles: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^firebase-admin$': '<rootDir>/__mocks__/firebase-admin.ts',
  },
  coverageThreshold: {
    global: {
        branches: 40,
      functions: 65,
      lines: 70,
      statements: 70,
    },
  },
};
