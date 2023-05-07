import { jwtPayloadDummy } from '../../dummy/jwt-payload.dummy';
import { accountDummy } from '../../../resources/accounts/dummy/accountDummy';

export const LocalAuthService = jest.fn().mockReturnValue({
  login: jest.fn().mockReturnValue({
    access_token: 'access_token',
    account: accountDummy(),
  }),
});
