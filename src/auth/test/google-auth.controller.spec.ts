import { Test, TestingModule } from '@nestjs/testing';
import { Account } from 'src/accounts/entities/account.entity';
import { accountStub } from 'src/accounts/test/stub/account.stub';
import { RegisterViewDto } from '../dto/register-view.dto';
import { AuthMessages } from '../enums/auth-messages';
import { GoogleAuthController } from '../controllers/google-auth.controller';
import { GoogleAuthService } from '../services/google-auth.service';
import { AccessToken } from '../dto/access-token.dto';
import { registerPayloadStub } from '../stub/register-payload.stub';

jest.mock('../services/google-auth.service');

describe('GoogleAuthController', () => {
  let googleAuthController: GoogleAuthController;
  let googleAuthService: GoogleAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleAuthController],
      providers: [GoogleAuthService],
    }).compile();

    googleAuthController =
      module.get<GoogleAuthController>(GoogleAuthController);
    googleAuthService = module.get<GoogleAuthService>(GoogleAuthService);
  });

  describe('login', () => {
    describe('when login method is called', () => {
      const dto = accountStub();

      let result: {
        data: RegisterViewDto;
        message: AuthMessages;
      };

      beforeEach(async () => {
        result = await googleAuthController.login(dto);
      });

      test('calls googleAuthService.login method', () => {
        expect(googleAuthService.login).toHaveBeenCalledWith(dto);
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

      const dto: AccessToken = {
        access_token: '',
      };

      beforeEach(async () => {
        result = await googleAuthController.register(dto);
      });

      test('calls googleAuthService.register with access_token', () => {
        expect(googleAuthService.register).toHaveBeenCalledWith(
          dto.access_token,
        );
      });

      it('should return the credentials', () => {
        expect(result).toEqual({
          data: registerPayloadStub(),
          message: AuthMessages.SUCCESSFUL_REGISTRATION,
        });
      });
    });
  });
});
