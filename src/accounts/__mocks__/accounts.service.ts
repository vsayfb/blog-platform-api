import { CreateAccountDto } from '../dto/create-account.dto';

export const AccountsService = jest.fn().mockReturnValue({
  create: jest.fn((dto: CreateAccountDto) => Promise.resolve(dto)),
});
