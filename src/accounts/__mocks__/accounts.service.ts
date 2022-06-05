import { resultAccountStub } from './../tests/stub/account.stub';

export const AccountsService = jest.fn().mockReturnValue({
  getAccount: jest.fn().mockResolvedValue(resultAccountStub()),
  createLocalAccount: jest.fn().mockResolvedValue(resultAccountStub()),
  createAccountViaGoogle: jest.fn().mockResolvedValue(resultAccountStub()),
});
