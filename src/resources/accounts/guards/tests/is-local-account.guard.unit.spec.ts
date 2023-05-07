import { Test } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { accountDummy } from '../../dummy/accountDummy';
import { jwtPayloadDummy } from '../../../../auth/dummy/jwt-payload.dummy';
import { AccountMessages } from '../../enums/account-messages';
import { LocalAccountsService } from '../../services/local-accounts.service';
import { IsLocalAccount } from '../is-local-account.guard';

jest.mock('../../services/local-accounts.service');

describe('IsLocalAccount', () => {
  let isLocalAccount: IsLocalAccount;
  let localAccountsService: LocalAccountsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [IsLocalAccount, LocalAccountsService],
    }).compile();

    isLocalAccount = moduleRef.get(IsLocalAccount);
    localAccountsService = moduleRef.get(LocalAccountsService);
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
        result = await isLocalAccount.canActivate(mockContext);
      });

      it('should call localAccountsService.getOneByID', function () {
        expect(localAccountsService.getOneByID).toHaveBeenCalledWith(
          jwtPayloadDummy().sub,
        );
      });

      it('should return true', function () {
        expect(result).toBe(true);
      });
    });

    describe('scenario : an account is not found with user.sub (client id) ', () => {
      beforeEach(async () => {
        result = await isLocalAccount.canActivate(mockContext);
      });

      it('should call localAccountsService.getOneByID', function () {
        expect(localAccountsService.getOneByID).toHaveBeenCalledWith(
          jwtPayloadDummy().sub,
        );
      });

      it('should throw a ForbiddenException', async function () {
        jest.spyOn(localAccountsService, 'getOneByID').mockResolvedValue(null);

        await expect(isLocalAccount.canActivate(mockContext)).rejects.toThrow(
          AccountMessages.NOT_FOUND,
        );
      });
    });
  });
});
