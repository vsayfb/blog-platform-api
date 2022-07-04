import { Test, TestingModule } from '@nestjs/testing';
import { RegisterViewDto } from 'src/accounts/dto/register-view.dto';
import { Account } from 'src/accounts/entities/account.entity';
import { accountStub } from 'src/accounts/test/stub/account.stub';
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
    describe('when login method is called', () => {
      const dto = accountStub() as Account;
      let result: { access_token: string };

      beforeEach(async () => {
        result = await authController.login(dto);
      });

      test('calls authService.login method', () => {
        expect(authService.login(dto));
      });

      it('should return an account', () => {
        expect(result).toEqual({ access_token: expect.any(String) });
      });
    });
  });

  describe('register', () => {
    describe('when register is called', () => {
      let result: RegisterViewDto;
      const dto = { ...accountStub(), verification_code: '123456' };

      beforeEach(async () => {
        result = await authController.register(dto);
      });

      test('calls authService.register with dto', () => {
        expect(authService.register).toHaveBeenCalledWith(dto);
      });

      it('should return an account', () => {
        expect(result).toEqual({
          data: expect.anything(),
          access_token: expect.any(String),
        });
      });
    });
  });

  describe('authGoogle', () => {
    describe('when authGoogle is called', () => {
      let dto: AccessToken = {
        access_token: '',
      };
      let result: RegisterViewDto;

      beforeEach(async () => {
        result = await authController.authGoogle(dto);
      });

      test('calls authService.googleAuth', () => {
        expect(authService.googleAuth).toHaveBeenCalledWith(dto.access_token);
      });

      it('should return the account', async () => {
        expect(result).toEqual({
          data: expect.anything(),
          access_token: expect.any(String),
        });
      });
    });
  });
});
