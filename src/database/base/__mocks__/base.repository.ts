import { resultAccountStub } from 'src/accounts/tests/stub/account.stub';

// ! nowhere doesn't mock manually

// ! will only export to other mock repositories

//* for example look accounts.repository inside mocks folder

export const BaseRepository = {
  createEntity: jest.fn().mockResolvedValue(resultAccountStub()),
};
