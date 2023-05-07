import { accountDummy } from 'src/resources/accounts/dummy/accountDummy';

export const LocalAccountsService = jest.fn().mockReturnValue({
  getOneByID: jest.fn().mockResolvedValue(accountDummy()),
});
