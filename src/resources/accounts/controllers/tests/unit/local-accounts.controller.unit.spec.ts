import { Test } from '@nestjs/testing';
import { LocalAccountsController } from '../../local-accounts.controller';
import { AccountsService } from '../../../services/accounts.service';
import { TwoFactorAuthService } from '../../../../tfa/services/two-factor-auth.service';
import { CodeMessages } from '../../../../verification_codes/enums/code-messages';
import { jwtPayloadDummy } from '../../../../../auth/dummy/jwt-payload.dummy';
import { verificationCodeDummy } from '../../../../verification_codes/dummy/verification-code.dummy';
import { NewPasswordDto } from '../../../request-dto/new-password.dto';
import { VerificationTokenDto } from '../../../../verification_codes/dto/verification-token.dto';
import { CodeProcess } from '../../../../verification_codes/entities/code.entity';
import { AccountMessages } from '../../../enums/account-messages';
import { IsLocalAccount } from '../../../guards/is-local-account.guard';
import { VerificationCodeMatches } from '../../../../verification_codes/guards/check-verification-code-matches.guard';
import { DeleteVerificationCodeInBody } from '../../../../verification_codes/interceptors/delete-code-in-body.interceptor';
import { LocalAccountsService } from '../../../services/local-accounts.service';
import { accountDummy } from '../../../dummy/accountDummy';
import { VerificationCodeDto } from '../../../../verification_codes/dto/verification-code.dto';
import { starEmail, starMobilePhone } from '../../../../../lib/star-text';
import { NotificationBy } from '../../../../../notifications/types/notification-by';

jest.mock('src/resources/accounts/services/accounts.service');
jest.mock('src/resources/tfa/services/two-factor-auth.service');
jest.mock('src/resources/accounts/services/local-accounts.service');

describe('LocalAccountsController', () => {
  let localAccountsController: LocalAccountsController;
  let localAccountsService: LocalAccountsService;
  let accountsService: AccountsService;
  let twoFactorAuthService: TwoFactorAuthService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [LocalAccountsController],
      providers: [LocalAccountsService, AccountsService, TwoFactorAuthService],
    })
      .overrideGuard(IsLocalAccount)
      .useValue(null)
      .overrideGuard(VerificationCodeMatches)
      .useValue(null)
      .overrideInterceptor(DeleteVerificationCodeInBody)
      .useValue(null)
      .compile();

    localAccountsController = moduleRef.get<LocalAccountsController>(
      LocalAccountsController,
    );

    localAccountsService =
      moduleRef.get<LocalAccountsService>(LocalAccountsService);

    accountsService = moduleRef.get<AccountsService>(AccountsService);

    twoFactorAuthService =
      moduleRef.get<TwoFactorAuthService>(TwoFactorAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updatePassword', () => {
    const client = jwtPayloadDummy();

    const verificationCode = verificationCodeDummy();

    const verificationTokenDto: VerificationTokenDto = {
      token: verificationCode.token,
    };

    const newPasswordDto: NewPasswordDto = { new_password: 'new_password' };

    describe('scenario : code process is not update_password', () => {
      it('should throw Error', async () => {
        await expect(
          localAccountsController.updatePassword(
            client,
            verificationTokenDto,
            verificationCode,
            newPasswordDto,
          ),
        ).rejects.toThrow(CodeMessages.INVALID_CODE);
      });
    });

    describe('scenario : code process is update_password', () => {
      let result;

      beforeEach(async () => {
        verificationCode.process = CodeProcess.UPDATE_PASSWORD;

        result = await localAccountsController.updatePassword(
          client,
          verificationTokenDto,
          verificationCode,
          newPasswordDto,
        );
      });

      it('should call accountsService.getOneByID', () => {
        expect(accountsService.getOneByID).toHaveBeenCalledWith(client.sub);
      });

      it('should call accountsService.update', () => {
        expect(accountsService.update).toHaveBeenCalledWith(accountDummy());
      });

      it('should return null', () => {
        expect(result).toEqual({
          data: null,
          message: AccountMessages.PASSWORD_UPDATED,
        });
      });
    });
  });

  describe('process', () => {
    const client = jwtPayloadDummy();

    const verificationCode = verificationCodeDummy();

    const verificationTokenDto: VerificationTokenDto = {
      token: verificationCode.token,
    };

    const verificationCodeDto: VerificationCodeDto = {
      verification_code: verificationCode.code,
    };

    describe('scenario : process is add_email_to_account', () => {
      let result;

      beforeEach(async () => {
        verificationCode.process = CodeProcess.ADD_EMAIL_TO_ACCOUNT;

        result = await localAccountsController.process(
          client,
          verificationTokenDto,
          verificationCodeDto,
          verificationCode,
        );
      });

      it('should call accountsService.getOneByID', function () {
        expect(localAccountsService.getOneByID).toHaveBeenCalledWith(
          client.sub,
        );
      });

      it('should call accountsService.update', function () {
        expect(accountsService.update).toHaveBeenCalledWith(accountDummy());
      });

      it('should return stared email', function () {
        expect(result).toEqual({
          data: { email: starEmail(verificationCode.receiver) },
          message: AccountMessages.EMAIL_ADDED,
        });
      });
    });

    describe('scenario : process is add_mobile_phone_to_account', () => {
      let result;

      beforeEach(async () => {
        verificationCode.receiver = '444433322';

        verificationCode.process = CodeProcess.ADD_MOBILE_PHONE_TO_ACCOUNT;

        result = await localAccountsController.process(
          client,
          verificationTokenDto,
          verificationCodeDto,
          verificationCode,
        );
      });

      it('should call accountsService.getOneByID', function () {
        expect(localAccountsService.getOneByID).toHaveBeenCalledWith(
          client.sub,
        );
      });

      it('should call accountsService.update', function () {
        expect(accountsService.update).toHaveBeenCalledWith(accountDummy());
      });

      it('should return stared mobile_phone', function () {
        expect(result).toEqual({
          data: { mobile_phone: starMobilePhone(verificationCode.receiver) },
          message: AccountMessages.MOBILE_PHONE_ADDED,
        });
      });
    });

    describe('scenario : process is remove_email_from_account', () => {
      let result;

      describe('scenario : if client has enabled two factor', () => {
        beforeEach(async () => {
          verificationCode.process = CodeProcess.REMOVE_EMAIL_FROM_ACCOUNT;

          result = await localAccountsController.process(
            client,
            verificationTokenDto,
            verificationCodeDto,
            verificationCode,
          );
        });

        it('should call accountsService.update', function () {
          expect(accountsService.update).toHaveBeenCalledWith(accountDummy());
        });

        it('should call twoFactorAuthService.getOneByAccountID', function () {
          expect(twoFactorAuthService.getOneByAccountID).toHaveBeenCalledWith(
            client.sub,
          );
        });

        it('should call twoFactorAuthService.delete', () => {
          expect(twoFactorAuthService.delete).toHaveBeenCalled();
        });

        it('should return null and message', () => {
          expect(result).toEqual({
            data: { email: null },
            message: AccountMessages.EMAIL_REMOVED,
          });
        });
      });

      describe('scenario : if client has not enabled two factor', () => {
        beforeEach(async () => {
          jest
            .spyOn(twoFactorAuthService, 'getOneByAccountID')
            .mockResolvedValue(null);

          verificationCode.process = CodeProcess.REMOVE_EMAIL_FROM_ACCOUNT;

          result = await localAccountsController.process(
            client,
            verificationTokenDto,
            verificationCodeDto,
            verificationCode,
          );
        });

        it('should return null and message', () => {
          expect(result).toEqual({
            data: { email: null },
            message: AccountMessages.EMAIL_REMOVED,
          });
        });
      });
    });

    describe('scenario : process is REMOVE_MOBILE_PHONE_FROM_ACCOUNT', () => {
      let result;

      describe('scenario : if client has enabled two factor', () => {
        beforeEach(async () => {
          jest
            .spyOn(twoFactorAuthService, 'getOneByAccountID')
            .mockResolvedValue({ via: NotificationBy.MOBILE_PHONE } as any);

          verificationCode.receiver = accountDummy().mobile_phone;

          verificationCode.process =
            CodeProcess.REMOVE_MOBILE_PHONE_FROM_ACCOUNT;

          result = await localAccountsController.process(
            client,
            verificationTokenDto,
            verificationCodeDto,
            verificationCode,
          );
        });

        it('should call accountsService.update', function () {
          expect(accountsService.update).toHaveBeenCalledWith(accountDummy());
        });

        it('should call twoFactorAuthService.getOneByAccountID', function () {
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

          verificationCode.process =
            CodeProcess.REMOVE_MOBILE_PHONE_FROM_ACCOUNT;

          result = await localAccountsController.process(
            client,
            verificationTokenDto,
            verificationCodeDto,
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
        verificationCode.process = CodeProcess.REGISTER_WITH_EMAIL;

        await expect(
          localAccountsController.process(
            client,
            verificationTokenDto,
            verificationCodeDto,
            verificationCode,
          ),
        ).rejects.toThrow(CodeMessages.INVALID_CODE);

        expect(localAccountsService.getOneByID).toHaveBeenCalledWith(
          client.sub,
        );
      });
    });
  });
});
