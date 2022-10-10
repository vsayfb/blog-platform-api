import { accountStub } from 'src/accounts/test/stub/account.stub';
import { CodeMessages } from 'src/codes/enums/code-messages';
import { uploadProfileResultStub } from 'src/uploads/stub/upload-profile.stub';

export const AccountsService = jest.fn().mockReturnValue({
  getOneByID: jest.fn().mockResolvedValue(accountStub()),
  getAccount: jest.fn().mockResolvedValue(accountStub()),
  getProfile: jest.fn().mockResolvedValue(accountStub()),
  createLocalAccount: jest.fn().mockResolvedValue(accountStub()),
  createAccountViaGoogle: jest.fn().mockResolvedValue(accountStub()),

  changeProfileImage: jest
    .fn()
    .mockResolvedValue(uploadProfileResultStub().newImage),

  beginLocalRegisterVerification: jest
    .fn()
    .mockResolvedValue({ message: CodeMessages.CODE_SENT }),

  getOneByUsername: jest.fn().mockResolvedValue(accountStub()),
  getOneByEmail: jest.fn().mockResolvedValue(accountStub()),
  searchByUsername: jest.fn().mockResolvedValue([accountStub()]),
  getAll: jest.fn().mockResolvedValue([accountStub()]),
});
