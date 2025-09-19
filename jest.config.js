export default {
  projects: [
    {
      displayName: 'frontend',
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
      },
      moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
      testMatch: [
        '<rootDir>/src/**/__tests__/**/*.(js|jsx|ts|tsx)',
        '<rootDir>/src/**/*.(test|spec).(js|jsx|ts|tsx)',
      ],
      collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/setupTests.js',
      ],
      transformIgnorePatterns: [
        'node_modules/(?!(.*\\.mjs$|@testing-library|@radix-ui))',
      ],
    },
    {
      displayName: 'backend',
      testEnvironment: 'node',
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
      },
      moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
      testMatch: [
        '<rootDir>/backend/**/__tests__/**/*.(js|jsx|ts|tsx)',
        '<rootDir>/backend/**/*.(test|spec).(js|jsx|ts|tsx)',
      ],
      collectCoverageFrom: [
        'backend/**/*.{js,jsx,ts,tsx}',
        '!backend/**/*.d.ts',
      ],
      transformIgnorePatterns: [
        'node_modules/(?!(.*\\.mjs$))',
      ],
    },
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
