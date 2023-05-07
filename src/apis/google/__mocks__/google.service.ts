import { googleUserCredentialsDummy } from '../dummy/google-credentials.dummy';

export const GoogleService = jest.fn().mockReturnValue({
  getUserCredentials: jest.fn().mockResolvedValue({
    email: googleUserCredentialsDummy().email,
    given_name: googleUserCredentialsDummy().givenName,
    family_name: googleUserCredentialsDummy().familyName,
  }),
});
