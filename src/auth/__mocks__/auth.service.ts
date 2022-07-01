import { resultAccountStub } from './../../accounts/tests/stub/account.stub';

export const AuthService = jest.fn().mockReturnValue({
  register: jest.fn().mockResolvedValue(resultAccountStub()),
  login: jest.fn().mockResolvedValue(resultAccountStub()),
  googleAuth: jest.fn().mockResolvedValue(resultAccountStub()),
});
