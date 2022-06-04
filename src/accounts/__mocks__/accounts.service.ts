import { resultAccountStub } from './../tests/stub/account.stub';

export const AccountsService = jest.fn().mockReturnValue({
  getAccount: jest.fn().mockResolvedValue(resultAccountStub()),
  createAccount: jest.fn().mockResolvedValue(resultAccountStub()),
});
