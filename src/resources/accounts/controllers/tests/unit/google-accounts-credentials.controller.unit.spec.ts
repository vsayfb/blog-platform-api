import { Test } from '@nestjs/testing';
import { GoogleAccountsCredentialsController } from '../../google-accounts-credentials.controller';
import { NotificationFactory } from '../../../../../notifications/services/notification-factory.service';
import { accountDummy } from '../../../dummy/accountDummy';
import { NewMobilePhoneDto } from '../../../request-dto/new-mobile-phone.dto';
import { AccountMessages } from '../../../enums/account-messages';
import { NotificationBy } from '../../../../../notifications/types/notification-by';
import { CodeMessages } from '../../../../verification_codes/enums/code-messages';
import { PasswordsMatch } from '../../../guards/passwords-match.guard';
import { VerificationCodeAlreadySentToAccount } from '../../../../verification_codes/guards/code-already-sent.guard';
import { PasswordDto } from '../../../request-dto/password.dto';

jest.mock('src/notifications/services/notification-factory.service');

describe('GoogleAccountsCredentialsController', () => {
  let googleAccountsCredentialsController: GoogleAccountsCredentialsController;
  let notificationFactory: NotificationFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GoogleAccountsCredentialsController],
      providers: [NotificationFactory],
    })
      .overrideGuard(PasswordsMatch)
      .useValue(null)
      .overrideGuard(VerificationCodeAlreadySentToAccount)
      .useValue(null)
      .compile();

    googleAccountsCredentialsController =
      moduleRef.get<GoogleAccountsCredentialsController>(
        GoogleAccountsCredentialsController,
      );

    notificationFactory =
      moduleRef.get<NotificationFactory>(NotificationFactory);
  });

  describe('addMobilePhone', () => {
    const account = accountDummy();

    const dto: NewMobilePhoneDto = {
      mobile_phone: '333222454',
      password: '1234567',
    };

    describe('scenario : account has already mobile phone', () => {
      it('should throw Error', async () => {
        await expect(
          googleAccountsCredentialsController.addMobilePhone(account, dto),
        ).rejects.toThrow(AccountMessages.HAS_MOBILE_PHONE);
      });
    });

    describe('scenario : account has not mobile phone', () => {
      let result;

      beforeEach(async () => {
        delete account.mobile_phone;

        result = await googleAccountsCredentialsController.addMobilePhone(
          account,
          dto,
        );
      });

      it('should call notificationFactory.createNotification', () => {
        expect(notificationFactory.createNotification).toHaveBeenCalledWith(
          NotificationBy.MOBILE_PHONE,
        );
      });

      it('should return following link', () => {
        expect(result).toEqual({
          following_url: expect.any(String),
          message: CodeMessages.CODE_SENT_TO_MOBILE_PHONE,
        });
      });
    });
  });

  describe('removeMobilePhone', () => {
    const account = accountDummy();

    const dto: PasswordDto = {
      password: '1234567',
    };

    describe('scenario : account has mobile phone', () => {
      let result;

      beforeEach(async () => {
        result = await googleAccountsCredentialsController.removeMobilPhone(
          account,
          dto,
        );
      });

      it('should call notificationFactory.createNotification', () => {
        expect(notificationFactory.createNotification).toHaveBeenCalledWith(
          NotificationBy.MOBILE_PHONE,
        );
      });

      it('should return following link', () => {
        expect(result).toEqual({
          following_url: expect.any(String),
          message: CodeMessages.CODE_SENT_TO_MOBILE_PHONE,
        });
      });
    });

    describe('scenario : account has not email', () => {
      it('should throw Error', async () => {
        delete account.email;

        await expect(
          googleAccountsCredentialsController.removeMobilPhone(account, dto),
        ).rejects.toThrow();
      });
    });

    describe('scenario : account has not mobile phone', () => {
      it('should throw Error', async () => {
        delete account.mobile_phone;

        await expect(
          googleAccountsCredentialsController.removeMobilPhone(account, dto),
        ).rejects.toThrow();
      });
    });
  });
});
