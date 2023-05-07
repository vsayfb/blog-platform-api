import { LocalAccountsCredentialsController } from '../../local-accounts-credentials.controller';
import { Test } from '@nestjs/testing';
import { NotificationFactory } from '../../../../../notifications/services/notification-factory.service';
import { IsLocalAccount } from '../../../guards/is-local-account.guard';
import { PasswordsMatch } from '../../../guards/passwords-match.guard';
import { VerificationCodeAlreadySentToAccount } from '../../../../verification_codes/guards/code-already-sent.guard';
import { NewMobilePhoneDto } from '../../../request-dto/new-mobile-phone.dto';
import { accountDummy } from '../../../dummy/accountDummy';
import { AccountMessages } from '../../../enums/account-messages';
import { NotificationBy } from '../../../../../notifications/types/notification-by';
import { CodeMessages } from '../../../../verification_codes/enums/code-messages';
import { NewEmailDto } from '../../../request-dto/add-new-email.dto';
import { PasswordDto } from '../../../request-dto/password.dto';

jest.mock('../../../../../notifications/services/notification-factory.service');

describe('LocalAccountsCredentialsController', () => {
  let localAccountsCredentialsController: LocalAccountsCredentialsController;
  let notificationFactory: NotificationFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [LocalAccountsCredentialsController],
      providers: [NotificationFactory],
    })
      .overrideGuard(IsLocalAccount)
      .useValue(null)
      .overrideGuard(PasswordsMatch)
      .useValue(null)
      .overrideGuard(VerificationCodeAlreadySentToAccount)
      .useValue(null)
      .compile();

    localAccountsCredentialsController = moduleRef.get(
      LocalAccountsCredentialsController,
    );

    notificationFactory = moduleRef.get(NotificationFactory);
  });

  describe('addMobilePhone', () => {
    let result;

    const account = accountDummy();

    const dto: NewMobilePhoneDto = {
      mobile_phone: '12321312',
      password: account.password,
    };

    describe('scenario : account already has a mobile phone', () => {
      it('should throw a ForbiddenException', async function () {
        await expect(
          localAccountsCredentialsController.addMobilePhone(account, dto),
        ).rejects.toThrow(AccountMessages.HAS_MOBILE_PHONE);
      });
    });

    describe('scenario : account has not mobile phone', function () {
      beforeEach(async () => {
        account.mobile_phone = null;

        result = await localAccountsCredentialsController.addMobilePhone(
          account,
          dto,
        );
      });

      it('should call notificationFactory.createNotification', function () {
        expect(notificationFactory.createNotification).toHaveBeenCalledWith(
          NotificationBy.MOBILE_PHONE,
        );
      });

      it('should return a following_url', function () {
        expect(result).toEqual({
          following_url: expect.any(String),
          message: CodeMessages.CODE_SENT_TO_MOBILE_PHONE,
        });
      });
    });
  });

  describe('addEmail', () => {
    let result;

    const account = accountDummy();

    const dto: NewEmailDto = {
      email: 'new@gmail.com',
      password: account.password,
    };

    describe('scenario : account already has an email', () => {
      it('should throw a ForbiddenException', async function () {
        await expect(
          localAccountsCredentialsController.addEmail(account, dto),
        ).rejects.toThrow(AccountMessages.HAS_EMAIL);
      });
    });

    describe('scenario : account has not an email', function () {
      beforeEach(async () => {
        account.email = null;

        result = await localAccountsCredentialsController.addEmail(
          account,
          dto,
        );
      });

      it('should call notificationFactory.createNotification', function () {
        expect(notificationFactory.createNotification).toHaveBeenCalledWith(
          NotificationBy.EMAIL,
        );
      });

      it('should return a following_url', function () {
        expect(result).toEqual({
          following_url: expect.any(String),
          message: CodeMessages.CODE_SENT_TO_EMAIL,
        });
      });
    });
  });

  describe('removeMobilePhone', () => {
    let result;

    const account = accountDummy();

    const dto: PasswordDto = {
      password: account.password,
    };

    describe('scenario : account has not a mobile phone', function () {
      it('should throw a ForbiddenException', async function () {
        const account = accountDummy();
        account.mobile_phone = null;

        await expect(
          localAccountsCredentialsController.removeMobilePhone(account, dto),
        ).rejects.toThrow(AccountMessages.HAS_NOT_MOBILE_PHONE);
      });
    });

    describe('scenario : account has not an email', function () {
      it('should throw a ForbiddenException', async function () {
        const account = accountDummy();
        account.email = null;

        await expect(
          localAccountsCredentialsController.removeMobilePhone(account, dto),
        ).rejects.toThrow(AccountMessages.MUST_HAS_PHONE_OR_EMAIL);
      });
    });

    describe('scenario : account has a mobile mobile phone and email', function () {
      beforeEach(async function () {
        result = await localAccountsCredentialsController.removeMobilePhone(
          account,
          dto,
        );
      });

      it('should call notificationFactory.createNotification', function () {
        expect(notificationFactory.createNotification).toHaveBeenCalledWith(
          NotificationBy.MOBILE_PHONE,
        );
      });

      it('should return a following_url', function () {
        expect(result).toEqual({
          following_url: expect.any(String),
          message: CodeMessages.CODE_SENT_TO_MOBILE_PHONE,
        });
      });
    });
  });

  describe('removeEmail', function () {
    let result;

    const account = accountDummy();

    const dto: PasswordDto = {
      password: account.password,
    };

    describe('scenario : account has not an email', function () {
      it('should throw a ForbiddenException', async function () {
        const account = accountDummy();
        account.email = null;

        await expect(
          localAccountsCredentialsController.removeEmail(account, dto),
        ).rejects.toThrow(AccountMessages.HAS_NOT_EMAIL);
      });
    });

    describe('scenario : account has not a mobile phone', function () {
      it('should throw a ForbiddenException', async function () {
        const account = accountDummy();
        account.mobile_phone = null;

        await expect(
          localAccountsCredentialsController.removeEmail(account, dto),
        ).rejects.toThrow(AccountMessages.MUST_HAS_PHONE_OR_EMAIL);
      });
    });

    describe('scenario : account has a mobile mobile phone and email', function () {
      beforeEach(async function () {
        result = await localAccountsCredentialsController.removeEmail(
          account,
          dto,
        );
      });

      it('should call notificationFactory.createNotification', function () {
        expect(notificationFactory.createNotification).toHaveBeenCalledWith(
          NotificationBy.EMAIL,
        );
      });

      it('should return a following_url', function () {
        expect(result).toEqual({
          following_url: expect.any(String),
          message: CodeMessages.CODE_SENT_TO_EMAIL,
        });
      });
    });
  });

  describe('changePassword', function () {
    let result;

    const account = accountDummy();

    const dto: PasswordDto = {
      password: account.password,
    };

    describe('scenario : account enabled two factor auth', function () {
      beforeEach(async function () {
        await localAccountsCredentialsController.changePassword(account, dto);
      });

      test('notificationFactory.createNotification called with default tfa', function () {
        expect(notificationFactory.createNotification).toHaveBeenCalledWith(
          NotificationBy.EMAIL,
        );
      });
    });

    describe('scenario : account has an email and had not enabled two factor auth', function () {
      beforeEach(async function () {
        await localAccountsCredentialsController.changePassword(account, dto);
      });

      test('notificationFactory.createNotification called with email', function () {
        expect(notificationFactory.createNotification).toHaveBeenCalledWith(
          NotificationBy.EMAIL,
        );
      });
    });

    describe('scenario : account has not an email and had not enabled two factor auth', function () {
      beforeEach(async function () {
        await localAccountsCredentialsController.changePassword(account, dto);
      });

      test('notificationFactory.createNotification called with email', function () {
        const account = accountDummy();

        account.email = null;

        expect(notificationFactory.createNotification).toHaveBeenCalledWith(
          NotificationBy.MOBILE_PHONE,
        );
      });
    });

    it('should return a following_url', async function () {
      const result = await localAccountsCredentialsController.changePassword(
        account,
        dto,
      );

      expect(result).toEqual({
        following_url: expect.any(String),
        message: expect.any(String),
      });
    });
  });
});
