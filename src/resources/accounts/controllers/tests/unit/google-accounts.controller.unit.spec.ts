import { Test } from '@nestjs/testing';
import { GoogleAccountsController } from 'src/resources/accounts/controllers/google-accounts.controller';
import { AccountMessages } from 'src/resources/accounts/enums/account-messages';
import { AccountsService } from 'src/resources/accounts/services/accounts.service';
import { GoogleAccountsService } from 'src/resources/accounts/services/google-accounts.service';
import { TwoFactorAuthService } from 'src/resources/tfa/services/two-factor-auth.service';
import { UpdateGoogleAccountPasswordDto } from '../../../request-dto/update-google-account-password.dto';
import { VerifyGoogleUser } from '../../../guards/verify-google-user.guard';
import { VerificationCodeMatches } from '../../../../verification_codes/guards/check-verification-code-matches.guard';
import { VerificationCodeDto } from '../../../../verification_codes/dto/verification-code.dto';
import { VerificationTokenDto } from '../../../../verification_codes/dto/verification-token.dto';
import { CodeProcess } from '../../../../verification_codes/entities/code.entity';
import { starMobilePhone } from '../../../../../lib/star-text';
import { accountDummy } from '../../../dummy/accountDummy';
import { CodeMessages } from '../../../../verification_codes/enums/code-messages';
import { NotificationBy } from '../../../../../notifications/types/notification-by';
import { jwtPayloadDummy } from '../../../../../auth/dummy/jwt-payload.dummy';
import { verificationCodeDummy } from '../../../../verification_codes/dummy/verification-code.dummy';

jest.mock('src/resources/accounts/services/accounts.service');
jest.mock('src/resources/accounts/services/google-accounts.service');
jest.mock('src/resources/tfa/services/two-factor-auth.service');

describe('GoogleAccountsController', () => {
  let googleAccountsController: GoogleAccountsController;
  let googleAccountsService: GoogleAccountsService;
  let accountsService: AccountsService;
  let twoFactorAuthService: TwoFactorAuthService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GoogleAccountsController],
      providers: [AccountsService, GoogleAccountsService, TwoFactorAuthService],
    })
      .overrideGuard(VerifyGoogleUser)
      .useValue(null)
      .overrideGuard(VerificationCodeMatches)
      .useValue(null)
      .compile();

    googleAccountsController = moduleRef.get<GoogleAccountsController>(
      GoogleAccountsController,
    );

    googleAccountsService = moduleRef.get<GoogleAccountsService>(
      GoogleAccountsService,
    );

    accountsService = moduleRef.get<AccountsService>(AccountsService);

    twoFactorAuthService =
      moduleRef.get<TwoFactorAuthService>(TwoFactorAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updatePassword', () => {
    let result: { data: null; message: AccountMessages };

    const client = jwtPayloadDummy();
    const dto: UpdateGoogleAccountPasswordDto = {
      new_password: 'new_pass',
      google_access_token: 'access_token',
    };

    beforeEach(async () => {
      result = await googleAccountsController.updatePassword(client, dto);
    });

    it('should call accounts.update', () => {
      expect(accountsService.update).toHaveBeenCalledWith(accountDummy());
    });

    it('should return null and message', () => {
      expect(result).toEqual({
        data: null,
        message: AccountMessages.PASSWORD_UPDATED,
      });
    });
  });

  describe('makeProcessOfCode', () => {
    let result;

    const client = jwtPayloadDummy();

    const verificationToken: VerificationTokenDto = {
      token: verificationCodeDummy().token,
    };

    const verificationCode = verificationCodeDummy();

    const dto: VerificationCodeDto = { verification_code: '123456' };

    describe('scenario : process is adding mobile to google account', () => {
      beforeEach(async () => {
        verificationCode.receiver = accountDummy().mobile_phone;

        verificationCode.process = CodeProcess.ADD_MOBILE_PHONE_TO_ACCOUNT;

        result = await googleAccountsController.process(
          client,
          verificationToken,
          dto,
          verificationCode,
        );
      });

      it('should call googleAccountsService.getOneByID', () => {
        expect(googleAccountsService.getOneByID).toHaveBeenCalledWith(
          client.sub,
        );
      });

      it('should call accounts.update', () => {
        expect(accountsService.update).toHaveBeenCalledWith(accountDummy());
      });

      it('should return null and message', () => {
        expect(result).toEqual({
          data: { mobile_phone: starMobilePhone(verificationCode.receiver) },
          message: AccountMessages.MOBILE_PHONE_ADDED,
        });
      });
    });

    describe('scenario : process is REMOVE_MOBILE_PHONE_FROM_ACCOUNT', () => {
      describe('scenario : if client has enabled two factor', () => {
        beforeEach(async () => {
          jest
            .spyOn(twoFactorAuthService, 'getOneByAccountID')
            .mockResolvedValue({ via: NotificationBy.MOBILE_PHONE } as any);

          verificationCode.receiver = accountDummy().mobile_phone;

          verificationCode.process =
            CodeProcess.REMOVE_MOBILE_PHONE_FROM_ACCOUNT;

          result = await googleAccountsController.process(
            client,
            verificationToken,
            dto,
            verificationCode,
          );
        });

        it('should call twoFactorAuthService.getOneByAccountID', () => {
          expect(twoFactorAuthService.getOneByAccountID).toHaveBeenCalledWith(
            client.sub,
          );
        });

        it('should call twoFactorAuthService.delete', () => {
          expect(twoFactorAuthService.delete).toHaveBeenCalled();
        });

        it('should return null and message', () => {
          expect(result).toEqual({
            data: { mobile_phone: null },
            message: AccountMessages.MOBILE_PHONE_REMOVED,
          });
        });
      });

      describe('scenario : if client has not enabled two factor', () => {
        beforeEach(async () => {
          jest
            .spyOn(twoFactorAuthService, 'getOneByAccountID')
            .mockResolvedValue(null);

          verificationCode.receiver = accountDummy().mobile_phone;

          verificationCode.process =
            CodeProcess.REMOVE_MOBILE_PHONE_FROM_ACCOUNT;

          result = await googleAccountsController.process(
            client,
            verificationToken,
            dto,
            verificationCode,
          );
        });

        it('should return null and message', () => {
          expect(result).toEqual({
            data: { mobile_phone: null },
            message: AccountMessages.MOBILE_PHONE_REMOVED,
          });
        });
      });
    });

    describe('scenario : process is unknown', () => {
      it('should throw error', async () => {
        verificationCode.process = CodeProcess.ADD_EMAIL_TO_ACCOUNT;

        await expect(
          googleAccountsController.process(
            client,
            verificationToken,
            dto,
            verificationCode,
          ),
        ).rejects.toThrow(CodeMessages.INVALID_CODE);

        expect(googleAccountsService.getOneByID).toHaveBeenCalledWith(
          client.sub,
        );
      });
    });
  });
});
