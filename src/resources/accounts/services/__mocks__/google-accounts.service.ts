import { accountDummy } from 'src/resources/accounts/dummy/accountDummy';

export const GoogleAccountsService = jest.fn().mockReturnValue({
  getOneByID: jest.fn().mockResolvedValue(accountDummy()),
});
