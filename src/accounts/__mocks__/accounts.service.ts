import { CODE_SENT } from './../../lib/api-messages/api-messages';
import { accountStub } from 'src/accounts/tests/stub/account.stub';
import { resultAccountStub } from './../tests/stub/account.stub';

export const AccountsService = jest.fn().mockReturnValue({
  getAccount: jest.fn().mockResolvedValue(accountStub()),
  getOneByUsername: jest.fn().mockResolvedValue(accountStub()),
  getOneByEmail: jest.fn().mockResolvedValue(accountStub()),
  createLocalAccount: jest.fn().mockResolvedValue(accountStub()),
  createAccountViaGoogle: jest.fn().mockResolvedValue(accountStub()),
  beginRegisterVerification: jest
    .fn()
    .mockResolvedValue({ message: CODE_SENT }),
  changeProfileImage: jest
    .fn()
    .mockResolvedValue({ newImage: 'https://newimage.com' }),
});
