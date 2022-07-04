import { GoogleUserCredentials } from './../google.service';

export const googleUserCredentialsStub: GoogleUserCredentials = {
  sub: Date.now().toString(),
  name: 'google_user',
  given_name: 'google',
  family_name: 'user',
  picture: null,
  email: 'googleuser@gmail.com',
  email_verified: true,
  locale: '',
  hd: '',
};
