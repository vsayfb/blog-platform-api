import { BeginVerificationDto } from './../dto/begin-verification.dto';
import { UsernameQuery } from './../dto/username-query.dto';
import {
  USERNAME_AVAILABLE,
  CODE_SENT,
} from './../../lib/api-messages/api-messages';
import { accountStub } from './stub/account.stub';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from '../accounts.controller';
import { AccountsService } from '../accounts.service';
import { BadRequestException } from '@nestjs/common';
import { jwtPayloadStub } from 'src/auth/stub/jwt-payload.stub';

jest.mock('../accounts.service');

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
      expect(accountsController.findMe(jwtPayloadStub)).toEqual(jwtPayloadStub);
    });
  });

  describe('isAvailableUsername', () => {
    const usernameQuery: UsernameQuery = {
      username: accountStub().username,
    };

    describe('scenario : username exists in db', () => {
      it('should throw BadRequestException', async () => {
        await expect(
          accountsController.isAvailableUsername(usernameQuery),
        ).rejects.toThrow(BadRequestException);

        expect(accountsService.getOneByUsername).toHaveBeenCalledWith(
          usernameQuery.username,
        );
      });
    });

    describe('scenario : username not exists in db', () => {
      it('should return the message', async () => {
        jest
          .spyOn(accountsService, 'getOneByUsername')
          .mockResolvedValueOnce(null);

        expect(
          await accountsController.isAvailableUsername(usernameQuery),
        ).toEqual({ message: USERNAME_AVAILABLE });

        expect(accountsService.getOneByUsername).toHaveBeenCalledWith(
          usernameQuery.username,
        );
      });
    });
  });

  describe('beginVerification', () => {
    describe('when beginVerification is called', () => {
      let beginVerificationDto: BeginVerificationDto = {
        email: accountStub().email,
        username: accountStub().username,
      };
      let result: { message: string };

      beforeEach(async () => {
        result = await accountsController.beginVerification(
          beginVerificationDto,
        );
      });

      test('calls the accountsService.beginRegisterVerification', () => {
        expect(accountsService.beginRegisterVerification).toHaveBeenCalledWith(
          beginVerificationDto.username,
          beginVerificationDto.email,
        );
      });

      it('should return a message', async () => {
        expect(result).toEqual({ message: CODE_SENT });
      });
    });
  });

  describe('uploadProfilePhoto', () => {
    let photo: Express.Multer.File;
    let result;
    describe('when uploadProfilePhoto is called', () => {
      beforeEach(async () => {
        result = await accountsController.uploadProfilePhoto(
          jwtPayloadStub,
          photo,
        );
      });

      test('calls the accountsService.changeProfileImage', () => {
        expect(accountsService.changeProfileImage).toHaveBeenCalledWith(
          jwtPayloadStub,
          photo,
        );
      });

      it('should return a image url which file is uploaded', () => {
        expect(result).toEqual({ newImage: expect.any(String) });
      });
    });
  });
});
