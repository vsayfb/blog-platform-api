import { ConfigService } from '@nestjs/config';
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
      providers: [
        AuthService,
        AccountsRepository,
        JwtService,
        { provide: ConfigService, useValue: { get: jest.fn(() => '') } },
      ],
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

  describe('login to account', () => {
    let account = accountStub();
    let result: { access_token: string };

    beforeEach(async () => {
      result = await authService.login(account);
    });

    test('calls sign method in JwtService', () => {
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('should return an access token', () => {
      expect(result).toEqual({
        access_token: expect.any(String),
      });
    });
  });

  describe('validate account', () => {
    let { username, email, password } = accountStub();
    let result: Account;

    beforeEach(async () => {
      result = await authService.validateAccount(username, password);
    });

    test('calls existsByUsernameOrEmail method in acc repo', () => {
      expect(accountsRepository.existsByUsername).toHaveBeenCalledWith(
        username,
      );
    });

    it('should validate the account', async () => {
      expect(result).toEqual({ id: expect.any(String), username, email });
    });
  });
});
