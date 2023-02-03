import { BeginVerificationDto } from '../../auth/dto/begin-verification.dto';
import { UsernameQuery } from '../dto/username-query.dto';
import { accountStub } from './stub/account.stub';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from '../controllers/accounts.controller';
import { AccountsService } from '../services/accounts.service';
import { jwtPayloadStub } from 'src/auth/stub/jwt-payload.stub';
import { AccountMessages } from '../enums/account-messages';

import { AccountProfileDto } from '../../profiles/response-dto/profile.dto';

jest.mock('../services/accounts.service');

describe('AccountsController', () => {
  let accountsController: AccountsController;
  let accountsService: AccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [AccountsService],
    }).compile();

    accountsController = module.get<AccountsController>(AccountsController);
    accountsService = module.get<AccountsService>(AccountsService);
  });

  describe('findMe', () => {
    it('should return the jwt payload', () => {
      expect(accountsController.findMe(jwtPayloadStub())).toEqual(
        jwtPayloadStub(),
      );
    });
  });

  describe('findOne', () => {
    describe('when findOne is called', () => {
      let result: {
        data: AccountProfileDto;
        message: AccountMessages;
      };
      const user: UsernameQuery = { username: accountStub().username };

      beforeEach(async () => {
        result = await accountsController.findOne(user);
      });

      test('calls accountsService.getProfile', () => {
        expect(accountsService.getProfile).toHaveBeenCalledWith(user.username);
      });

      it('should return the account', () => {
        expect(result.data).toEqual(accountStub());
      });
    });
  });

  describe('isAvailableUsername', () => {
    const usernameQuery: UsernameQuery = {
      username: accountStub().username,
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

  describe('uploadProfilePhoto', () => {
    let photo: Express.Multer.File;
    let result: { data: string; message: AccountMessages };
    describe('when uploadProfilePhoto is called', () => {
      beforeEach(async () => {
        result = await accountsController.uploadProfilePhoto(
          jwtPayloadStub(),
          photo,
        );
      });

      test('calls the accountsService.changeProfileImage', () => {
        expect(accountsService.changeProfileImage).toHaveBeenCalledWith(
          jwtPayloadStub(),
          photo,
        );
      });

      it('should return a image url which file is uploaded', () => {
        expect(result).toEqual({
          data: expect.any(String),
          message: AccountMessages.PP_CHANGED,
        });
      });
    });
  });
});
