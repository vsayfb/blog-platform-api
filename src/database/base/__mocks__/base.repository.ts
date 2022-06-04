import { accountStub } from 'src/accounts/tests/stub/account.stub';
import { randomUUID } from 'crypto';

// ! nowhere doesn't mock manually

// ! will only export to other mock repositories

//* for example look accounts.repository inside mocks folder

export const BaseRepository = {
  createEntity: jest
    .fn()
    .mockResolvedValue({ id: randomUUID(), ...accountStub() }),
};
