import { Test } from '@nestjs/testing';
import { IsGoogleAccount } from '../is-google-account.guard';
import { GoogleAccountsService } from '../../services/google-accounts.service';
import { ExecutionContext } from '@nestjs/common';
import { accountDummy } from '../../dummy/accountDummy';
import { jwtPayloadDummy } from '../../../../auth/dummy/jwt-payload.dummy';
import { AccountMessages } from '../../enums/account-messages';

jest.mock('../../services/google-accounts.service');

describe('IsGoogleAccountGuard', () => {
  let isGoogleAccount: IsGoogleAccount;
  let googleAccountsService: GoogleAccountsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [IsGoogleAccount, GoogleAccountsService],
    }).compile();

    isGoogleAccount = moduleRef.get(IsGoogleAccount);
    googleAccountsService = moduleRef.get(GoogleAccountsService);
  });

  const mockContext: ExecutionContext = {
    switchToHttp: jest.fn().mockReturnThis(),
    getRequest: jest.fn().mockReturnValue({
      account_credentials: accountDummy(),
      user: jwtPayloadDummy(),
    }),
  } as unknown as ExecutionContext;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    let result;

    describe('scenario : an account is found with user.sub (client id) ', () => {
      beforeEach(async () => {
        result = await isGoogleAccount.canActivate(mockContext);
      });

      it('should call googleAccountsService.getOneByID', function () {
        expect(googleAccountsService.getOneByID).toHaveBeenCalledWith(
          jwtPayloadDummy().sub,
        );
      });

      it('should return true', function () {
        expect(result).toBe(true);
      });
    });

    describe('scenario : an account is not found with user.sub (client id) ', () => {
      beforeEach(async () => {
        result = await isGoogleAccount.canActivate(mockContext);
      });

      it('should call googleAccountsService.getOneByID', function () {
        expect(googleAccountsService.getOneByID).toHaveBeenCalledWith(
          jwtPayloadDummy().sub,
        );
      });

      it('should throw a ForbiddenException', async function () {
        jest.spyOn(googleAccountsService, 'getOneByID').mockResolvedValue(null);

        await expect(isGoogleAccount.canActivate(mockContext)).rejects.toThrow(
          AccountMessages.NOT_FOUND,
        );
      });
    });
  });
});
