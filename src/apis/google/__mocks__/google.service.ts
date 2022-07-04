import { accountStub } from 'src/accounts/test/stub/account.stub';

export const GoogleService = jest.fn().mockReturnValue({
  getUserCredentials: jest.fn().mockResolvedValue({
    email: accountStub().email,
    given_name: accountStub().username,
    family_name: accountStub().username,
  }),
});
