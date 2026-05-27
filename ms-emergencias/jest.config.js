/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.ts'],
    coverageDirectory: 'coverage',
    coverageThreshold: {
      global: {
        branches: 40,
        functions: 45,
        lines: 65,
        statements: 65,
      },
    },
};
