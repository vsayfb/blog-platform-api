import { accountStub } from 'src/accounts/test/stub/account.stub';

export const AuthService = jest.fn().mockReturnValue({
  register: jest
    .fn()
    .mockResolvedValue({ data: accountStub(), access_token: '' }),
  login: jest.fn().mockResolvedValue({ access_token: '' }),
  googleAuth: jest
    .fn()
    .mockResolvedValue({ data: accountStub(), access_token: '' }),
});
