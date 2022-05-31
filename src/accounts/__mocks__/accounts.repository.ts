import { randomUUID } from 'crypto';
import { CreateAccountDto } from '../dto/create-account.dto';
import { accountStub } from '../tests/stub/account.stub';

export const AccountsRepository = jest.fn().mockReturnValue({
  createAccount: jest.fn((dto: CreateAccountDto) =>
    Promise.resolve({ id: randomUUID(), ...dto }),
  ),
  existsByUsername: jest.fn().mockResolvedValue(false),
  existsByEmail: jest.fn().mockResolvedValue(false),
  findByUsernameOrEmail: jest
    .fn()
    .mockResolvedValue({ ...accountStub(), id: randomUUID() }),
});
