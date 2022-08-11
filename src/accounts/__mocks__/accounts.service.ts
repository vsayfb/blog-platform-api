import { accountStub } from 'src/accounts/test/stub/account.stub';
import { CodeMessages } from 'src/codes/enums/code-messages';
import { uploadProfileResultStub } from 'src/uploads/stub/upload-profile.stub';

export const AccountsService = jest.fn().mockReturnValue({
  getAccount: jest.fn().mockResolvedValue(accountStub()),
  getProfile: jest.fn().mockResolvedValue(accountStub()),
  getOne: jest.fn().mockResolvedValue(accountStub()),
  getOneByUsername: jest.fn().mockResolvedValue(accountStub()),
  getOneByEmail: jest.fn().mockResolvedValue(accountStub()),
  createLocalAccount: jest.fn().mockResolvedValue(accountStub()),
  createAccountViaGoogle: jest.fn().mockResolvedValue(accountStub()),
  beginRegisterVerification: jest
    .fn()
    .mockResolvedValue({ message: CodeMessages.CODE_SENT }),
  changeProfileImage: jest
    .fn()
    .mockResolvedValue({ newImage: uploadProfileResultStub().newImage }),
});
