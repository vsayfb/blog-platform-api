import { Test, TestingModule } from '@nestjs/testing';
import { Account } from 'src/accounts/entities/account.entity';
import {
  accountStub,
  resultAccountStub,
} from 'src/accounts/tests/stub/account.stub';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { AccessToken } from '../dto/access-token.dto';

jest.mock('../auth.service');

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return the account', async () => {
      expect(await authController.login(accountStub() as Account)).toEqual(
        resultAccountStub(),
      );
    });
  });

  describe('register', () => {
    it('should create an account and return that', async () => {
      const dto = { ...accountStub(), verification_code: '123456' };
      //
      expect(await authController.register(dto)).toEqual({
        ...resultAccountStub(),
        id: expect.any(String),
      });

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(authService.register).toHaveBeenCalledTimes(1);
    });
  });

  describe('authGoogle', () => {
    let body: AccessToken = {
      access_token: '',
    };

    it('should return the account', async () => {
      expect(await authController.authGoogle(body)).toEqual(
        resultAccountStub(),
      );
    });
  });
});
