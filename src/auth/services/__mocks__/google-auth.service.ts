import { accountStub } from 'src/resources/accounts/test/stub/account.stub';

export const GoogleAuthService = jest.fn().mockReturnValue({
  login: jest
    .fn()
    .mockReturnValue({ account: accountStub(), access_token: '' }),
  validateAccount: jest.fn().mockResolvedValue(accountStub()),
  register: jest
    .fn()
    .mockResolvedValue({ account: accountStub(), access_token: '' }),
});
