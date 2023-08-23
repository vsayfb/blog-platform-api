import { Config } from '@jest/types';

const config: Config.InitialOptions = {
  rootDir: 'src',
  displayName: 'unit',
  testRegex: '.*\\.unit.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
};

export default config;
