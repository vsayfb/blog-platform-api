import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from 'src/resources/accounts/controllers/accounts.controller';
import { AccountsService } from 'src/resources/accounts/services/accounts.service';
import { jwtPayloadDummy } from 'src/auth/dummy/jwt-payload.dummy';
import { MANAGE_DATA_SERVICE } from 'src/lib/constants';
import { CaslAbilityFactory } from 'src/global/casl/casl-ability.factory';
import { CachePersonalJSON } from 'src/cache/interceptors/cache-personal-json.interceptor';
import { accountDummy } from 'src/resources/accounts/dummy/accountDummy';
import { AccountMessages } from 'src/resources/accounts/enums/account-messages';
import { starEmail, starMobilePhone } from 'src/lib/star-text';
import { UniqueUsernameDto } from 'src/resources/accounts/request-dto/unique-username.dto';
import { UsernameDto } from 'src/resources/accounts/request-dto/username.dto';
import { EmailDto } from 'src/resources/accounts/request-dto/email.dto';

jest.mock('src/resources/accounts/services/accounts.service');
jest.mock('src/global/casl/casl-ability.factory');
jest.mock('src/cache/interceptors/cache-personal-json.interceptor');

describe('AccountsController', () => {
  let accountsController: AccountsController;
  let accountsService: AccountsService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [
        AccountsService,
        { provide: MANAGE_DATA_SERVICE, useClass: AccountsService },
        CaslAbilityFactory,
        CachePersonalJSON,
      ],
    }).compile();

    accountsController = moduleRef.get<AccountsController>(AccountsController);
    accountsService = moduleRef.get<AccountsService>(AccountsService);
  });

  describe('findClient', () => {
    it('should return the jwt payload', async () => {
      const client = jwtPayloadDummy();

      const result = await accountsController.findClient(client);

      expect(accountsService.getCredentialsByID).toHaveBeenCalledWith(
        client.sub,
      );

      const { password, ...expected } = accountDummy();

      expected.mobile_phone = starMobilePhone(expected.mobile_phone);

      expected.email = starEmail(expected.email);

      expect(result).toEqual({
        data: expected,
        message: AccountMessages.FOUND,
      });
    });
  });

  describe('updateUsername', () => {
    describe('when updateUsername is called', () => {
      let result;

      const user = accountDummy() as any;

      const usernameDto: UniqueUsernameDto = { username: 'new_username' };

      beforeEach(async () => {
        result = await accountsController.updateUsername(user, usernameDto);
      });

      it('should call accountsService.setUsername', () => {
        expect(accountsService.setUsername).toHaveBeenCalledWith(
          user,
          usernameDto.username,
        );
      });

      it('should call accountsService.update', () => {
        expect(accountsService.update).toHaveBeenCalledWith(user);
      });

      it('should return the account', () => {
        expect(result).toEqual({
          data: accountDummy(),
          message: AccountMessages.UPDATED,
        });
      });
    });
  });

  describe('isAvailableUsername', () => {
    const usernameQuery: UsernameDto = {
      username: accountDummy().username,
    };

    describe('scenario : username exists in db', () => {
      it('should return false', async () => {
        const result = await accountsController.isAvailableUsername(
          usernameQuery,
        );

        expect(result.data).toBe(false);
      });
    });

    describe('scenario : username not exists in db', () => {
      it('should return true', async () => {
        jest
          .spyOn(accountsService, 'getOneByUsername')
          .mockResolvedValueOnce(null);

        const result = await accountsController.isAvailableUsername(
          usernameQuery,
        );

        expect(result.data).toBe(true);
      });
    });
  });

  describe('isAvailableEmail', () => {
    const emailDto: EmailDto = {
      email: accountDummy().username,
    };

    describe('scenario : email exists in db', () => {
      it('should return false', async () => {
        const result = await accountsController.isAvailableEmail(emailDto);

        expect(result.data).toBe(false);
      });
    });

    describe('scenario : email not exists in db', () => {
      it('should return true', async () => {
        jest
          .spyOn(accountsService, 'getOneByEmail')
          .mockResolvedValueOnce(null);

        const result = await accountsController.isAvailableEmail(emailDto);

        expect(result.data).toBe(true);
      });
    });
  });
});
