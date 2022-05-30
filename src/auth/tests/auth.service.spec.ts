import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AccountsRepository } from 'src/accounts/accounts.repository';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';
import { accountStub } from 'src/accounts/tests/stub/account.stub';
import { AuthService } from '../auth.service';

jest.mock('src/accounts/accounts.repository');

describe('AuthService', () => {
  let authService: AuthService;
  let accountsRepository: AccountsRepository;
  let mockJwtService = {
    sign: jest.fn().mockImplementation(() => ''),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AuthService, AccountsRepository, JwtService],
    })
      .overrideProvider(JwtService)
      .useValue(mockJwtService)
      .compile();

    authService = module.get<AuthService>(AuthService);
    accountsRepository = module.get<AccountsRepository>(AccountsRepository);
  });

  it('should create an account return that', async () => {
    expect(await authService.register(accountStub())).toEqual({
      id: expect.any(String),
      ...accountStub(),
    });

    expect(accountsRepository.createAccount).toHaveBeenCalledWith(
      accountStub(),
    );
  });
});
