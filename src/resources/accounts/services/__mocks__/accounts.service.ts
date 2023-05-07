import { accountDummy } from 'src/resources/accounts/dummy/accountDummy';

export const AccountsService = jest.fn().mockReturnValue({
  getOneByID: jest.fn().mockResolvedValue(accountDummy()),
  getCredentialsByID: jest.fn().mockResolvedValue(accountDummy()),
  update: jest
    .fn()
    .mockImplementation((dto, update) => ({ ...dto, ...update })),
  getOneByUsername: jest.fn().mockResolvedValue(accountDummy()),
  getOneByEmail: jest.fn().mockResolvedValue(accountDummy()),
  setPassword: jest.fn().mockResolvedValue(undefined),
  setUsername: jest.fn().mockReturnValue(undefined),
  setDisplayName: jest.fn().mockReturnValue(undefined),
  setEmail: jest.fn().mockReturnValue(undefined),
  setMobilePhone: jest.fn().mockReturnValue(undefined),
});
