import { JwtPayload } from '../../lib/jwt.payload';
import { accountDummy } from '../../resources/accounts/dummy/accountDummy';

export const jwtPayloadDummy = (): JwtPayload => ({
  username: accountDummy().username,
  sub: accountDummy().id,
  display_name: accountDummy().display_name,
  image: accountDummy().image,
  role: accountDummy().role,
  exp: 123123,
  iat: 21312312,
});
