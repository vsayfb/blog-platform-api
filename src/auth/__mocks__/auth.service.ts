import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';

export const AuthService = jest.fn().mockReturnValue({
  register: jest.fn(async (dto: CreateAccountDto) => {
    return Promise.resolve(dto);
  }),
});
