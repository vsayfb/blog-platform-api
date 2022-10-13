import { accountStub } from 'src/accounts/test/stub/account.stub';
import { uploadProfileResultStub } from 'src/uploads/stub/upload-profile.stub';

export const AccountsService = jest.fn().mockReturnValue({
  getOneByID: jest.fn().mockResolvedValue(accountStub()),
  getAccount: jest.fn().mockResolvedValue(accountStub()),
  getProfile: jest.fn().mockResolvedValue(accountStub()),
  create: jest.fn().mockResolvedValue(accountStub()),

  changeProfileImage: jest
    .fn()
    .mockResolvedValue(uploadProfileResultStub().newImage),

  getOneByUsername: jest.fn().mockResolvedValue(accountStub()),
  getOneByEmail: jest.fn().mockResolvedValue(accountStub()),
  searchByUsername: jest.fn().mockResolvedValue([accountStub()]),
  getAll: jest.fn().mockResolvedValue([accountStub()]),
});
