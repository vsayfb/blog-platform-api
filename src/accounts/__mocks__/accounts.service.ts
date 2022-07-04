import { CODE_SENT } from './../../lib/api-messages/api-messages';
import { accountStub } from 'src/accounts/test/stub/account.stub';
import { uploadProfileResultStub } from 'src/uploads/stub/upload-profile.stub';

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
    .mockResolvedValue({ newImage: uploadProfileResultStub.newImage }),
});
