import { Config } from '@jest/types';

const config: Config.InitialOptions = {
  projects: [
    '<rootDir>/jest.unit.config.ts',
    '<rootDir>/jest.int.config.ts',
    '<rootDir>/jest.e2e.config.ts',
  ],
};

export default config;
