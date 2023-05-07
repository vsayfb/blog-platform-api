import { Config } from '@jest/types';

const config: Config.InitialOptions = {
  rootDir: 'src',
  displayName: 'int',
  testRegex: '.*\\.int.spec\\.ts$',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  maxWorkers: 1,
};

export default config;
