import { accountStub } from 'src/accounts/test/stub/account.stub';
import { googleUserCredentialsStub } from '../stub/google-credentials.stub';

export const GoogleService = jest.fn().mockReturnValue({
  getUserCredentials: jest.fn().mockResolvedValue({
    email: googleUserCredentialsStub().email,
    given_name: googleUserCredentialsStub().given_name,
    family_name: googleUserCredentialsStub().family_name,
  }),
});
