import { resultAccountStub } from './../tests/stub/account.stub';
import { BaseRepository } from 'src/database/base/__mocks__/base.repository';

export const AccountsRepository = jest.fn().mockReturnValue({
  ...BaseRepository,
  createAccount: jest.fn().mockResolvedValue(resultAccountStub()),
  existsByUsername: jest.fn().mockResolvedValue(false),
  existsByEmail: jest.fn().mockResolvedValue(false),
  findByUsernameOrEmail: jest.fn().mockResolvedValue(resultAccountStub()),
});
