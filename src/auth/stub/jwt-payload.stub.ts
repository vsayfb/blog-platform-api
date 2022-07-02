import { accountStub } from 'src/accounts/tests/stub/account.stub';
import { JwtPayload } from './../../lib/jwt.payload';

export const jwtPayloadStub: JwtPayload = {
  username: accountStub().username,
  image: accountStub().image,
  sub: accountStub().id,
  iat: 123456,
  exp: 123456,
  role: accountStub().role,
};
