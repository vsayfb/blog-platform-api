import { accountStub } from 'src/resources/accounts/test/stub/account.stub';

export const GoogleAccountsService = jest.fn().mockReturnValue({
  create: jest.fn().mockResolvedValue(accountStub()),
  getOneByEmail: jest.fn().mockResolvedValue(accountStub()),
});
