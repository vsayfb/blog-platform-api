import { accountStub } from 'src/resources/accounts/test/stub/account.stub';
import { JwtPayload } from './../../lib/jwt.payload';

export const jwtPayloadStub = (): JwtPayload => ({
  sub: accountStub().id,
  username: accountStub().username,
  image: accountStub().image,
  display_name: accountStub().display_name,
  iat: 123456,
  exp: 123456,
  role: accountStub().role,
});
