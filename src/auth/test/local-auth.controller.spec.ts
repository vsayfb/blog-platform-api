import { Test, TestingModule } from '@nestjs/testing';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';
import { Account } from 'src/accounts/entities/account.entity';
import { accountStub } from 'src/accounts/test/stub/account.stub';
import { LocalAuthController } from '../controllers/local-auth.controller';
import { LocalAuthService } from '../services/local-auth.service';
import { RegisterViewDto } from '../dto/register-view.dto';
import { AuthMessages } from '../enums/auth-messages';
import { BeginVerificationDto } from '../dto/begin-verification.dto';
import { CodeMessages } from 'src/codes/enums/code-messages';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { registerPayloadStub } from '../stub/register-payload.stub';

jest.mock('../services/local-auth.service');

describe('localAuthController', () => {
  let localAuthController: LocalAuthController;
  let localAuthService: LocalAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocalAuthController],
      providers: [LocalAuthService],
    }).compile();

    localAuthController = module.get<LocalAuthController>(LocalAuthController);
    localAuthService = module.get<LocalAuthService>(LocalAuthService);
  });

  describe('login', () => {
    describe('when login method is called', () => {
      const dto = accountStub() as Account;
      let result: {
        data: RegisterViewDto;
        message: AuthMessages;
      };

      beforeEach(() => {
        result = localAuthController.login(dto);
      });

      test('calls localAuthService.login method', () => {
        expect(localAuthService.login).toHaveBeenCalledWith(dto);
      });

      it('should return the credentials', () => {
        expect(result).toEqual({
          data: registerPayloadStub(),
          message: AuthMessages.SUCCESSFUL_LOGIN,
        });
      });
    });
  });

  describe('register', () => {
    describe('when register is called', () => {
      let result: { data: RegisterViewDto; message: AuthMessages };
      const dto: CreateAccountDto = {
        verification_code: '123456',
        username: accountStub().username,
        email: 'foo@gmail.com',
        display_name: accountStub().display_name,
        password: 'foo_password',
      };

      beforeEach(async () => {
        result = await localAuthController.register(dto);
      });

      test('calls localAuthService.register with dto', () => {
        expect(localAuthService.register).toHaveBeenCalledWith(dto);
      });

      it('should return the credentials', () => {
        expect(result).toEqual({
          data: registerPayloadStub(),
          message: AuthMessages.SUCCESSFUL_REGISTRATION,
        });
      });
    });
  });

  describe('beginVerification', () => {
    describe('when beginVerification is called', () => {
      const beginVerificationDto: BeginVerificationDto = {
        email: 'foo@gmail.com',
        username: accountStub().username,
      };
      let result: { message: string };

      beforeEach(async () => {
        result = await localAuthController.beginVerification(
          beginVerificationDto,
        );
      });

      test('calls the localAuthService.beginRegisterVerification', () => {
        expect(localAuthService.beginRegisterVerification).toHaveBeenCalledWith(
          beginVerificationDto.username,
          beginVerificationDto.email,
        );
      });

      it('should return a message', async () => {
        expect(result).toEqual({ message: CodeMessages.CODE_SENT });
      });
    });
  });
});
