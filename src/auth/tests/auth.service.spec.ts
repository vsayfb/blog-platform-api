import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AccountsRepository } from 'src/accounts/accounts.repository';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';
import { Account } from 'src/accounts/entities/account.entity';
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

  describe('create account', () => {
    let dto: CreateAccountDto = accountStub();
    let result: Account;

    beforeEach(async () => {
      result = await authService.register(accountStub());
    });

    test('calls existsByUsername method', () => {
      expect(accountsRepository.existsByUsername).toHaveBeenCalled();
    });

    test('calls existsByEmail method', () => {
      expect(accountsRepository.existsByEmail).toHaveBeenCalled();
    });

    test('calls createAccount method with received value', () => {
      expect(accountsRepository.createAccount).toHaveBeenCalledWith(dto);
    });

    it('should create an account return that', async () => {
      expect(result).toEqual({
        id: expect.any(String),
        ...dto,
      });
    });
  });
});
