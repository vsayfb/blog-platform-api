import { Test, TestingModule } from '@nestjs/testing';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';
import { Account } from 'src/accounts/entities/account.entity';
import { accountStub } from 'src/accounts/test/stub/account.stub';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { AccessToken } from '../dto/access-token.dto';
import { RegisterViewDto } from '../dto/register-view.dto';
import { AuthMessages } from '../enums/auth-messages';

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
      let result: { data: { access_token: string }; message: AuthMessages };

      beforeEach(() => {
        result = authController.login(dto);
      });

      test('calls authService.login method', () => {
        expect(authService.login).toHaveBeenCalledWith(dto);
      });

      it('should return a token', () => {
        expect(result).toEqual({
          data: {
            access_token: expect.any(String),
          },
          message: AuthMessages.SUCCESSFUL_LOGIN,
        });
      });
    });
  });

  describe('create', () => {
    describe('when create is called', () => {
      let result: { data: RegisterViewDto; message: AuthMessages };
      const dto: CreateAccountDto = {
        verification_code: '123456',
        username: accountStub().username,
        email: 'foo@gmail.com',
        display_name: accountStub().display_name,
        password: 'foo_password',
      };

      beforeEach(async () => {
        result = await authController.create(dto);
      });

      test('calls authService.register with dto', () => {
        expect(authService.register).toHaveBeenCalledWith(dto);
      });

      it('should return an account', () => {
        expect(result).toEqual({
          data: { data: expect.anything(), access_token: expect.any(String) },
          message: AuthMessages.SUCCESSFUL_REGISTRATION,
        });
      });
    });
  });

  describe('authGoogle', () => {
    describe('when authGoogle is called', () => {
      const dto: AccessToken = {
        access_token: '',
      };
      let result: { data: RegisterViewDto; message: AuthMessages };

      beforeEach(async () => {
        result = await authController.authGoogle(dto);
      });

      test('calls authService.googleAuth', () => {
        expect(authService.googleAuth).toHaveBeenCalledWith(dto.access_token);
      });

      it('should return the account', async () => {
        expect(result).toEqual({
          data: {
            data: expect.anything(),
            access_token: expect.any(String),
          },
          message: AuthMessages.SUCCESSFUL_REGISTRATION,
        });
      });
    });
  });
});
