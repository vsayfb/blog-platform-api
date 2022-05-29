import { randomUUID } from 'crypto';
import { CreateAccountDto } from '../dto/create-account.dto';

export const AccountsRepository = jest.fn().mockReturnValue({
  createAccount: jest.fn((dto: CreateAccountDto) =>
    Promise.resolve({ id: randomUUID(), ...dto }),
  ),
});
