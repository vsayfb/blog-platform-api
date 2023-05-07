import { VerifyGoogleUser } from '../verify-google-user.guard';
import {
  GoogleService,
  GoogleUserCredentials,
} from '../../../../apis/google/google.service';
import { Test } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { googleUserCredentialsDummy } from '../../../../apis/google/dummy/google-credentials.dummy';
import { AccountMessages } from '../../enums/account-messages';

jest.mock('../../../../apis/google/google.service');

describe('VerifyGoogleUser', () => {
  let verifyGoogleUser: VerifyGoogleUser;
  let googleService: GoogleService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [VerifyGoogleUser, GoogleService],
    }).compile();

    verifyGoogleUser = moduleRef.get(VerifyGoogleUser);
    googleService = moduleRef.get(GoogleService);
  });

  const google_access_token = 'access_token';

  const mockContext: ExecutionContext = {
    switchToHttp: jest.fn().mockReturnThis(),
    getRequest: jest.fn().mockReturnValue({
      body: { google_access_token },
      verified_google_user: googleUserCredentialsDummy(),
    }),
  } as unknown as ExecutionContext;

  describe('canActive', () => {
    let result;

    describe('scenario : if a google account is found', () => {
      beforeEach(async () => {
        result = await verifyGoogleUser.canActivate(mockContext);
      });

      it('should call googleService.getUserCredentials', () => {
        expect(googleService.getUserCredentials).toHaveBeenCalledWith(
          google_access_token,
        );
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });

    describe('scenario : if a google account is not found', () => {
      beforeEach(async () => {
        result = await verifyGoogleUser.canActivate(mockContext);
      });

      it('should call googleService.getUserCredentials', () => {
        expect(googleService.getUserCredentials).toHaveBeenCalledWith(
          google_access_token,
        );
      });

      it('should throw a ForbiddenException', async () => {
        jest.spyOn(googleService, 'getUserCredentials').mockResolvedValue(null);

        await expect(verifyGoogleUser.canActivate(mockContext)).rejects.toThrow(
          AccountMessages.NOT_FOUND,
        );
      });
    });
  });
});
