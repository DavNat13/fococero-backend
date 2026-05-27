/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.ts'],
    coverageDirectory: 'coverage',
    coverageThreshold: {
      global: {
        branches: 30,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
};
