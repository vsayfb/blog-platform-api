import { Config } from '@jest/types';

const config: Config.InitialOptions = {
  rootDir: 'src',
  displayName: 'unit',
  testRegex: '.*\\.unit.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};

export default config;
