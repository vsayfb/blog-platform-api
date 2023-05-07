import { Test } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { accountDummy } from '../../dummy/accountDummy';
import { AccountMessages } from '../../enums/account-messages';
import { PasswordsMatch } from '../passwords-match.guard';
import { AccountsService } from '../../services/accounts.service';
import { PasswordManagerService } from '../../services/password-manager.service';
import { jwtPayloadDummy } from '../../../../auth/dummy/jwt-payload.dummy';

jest.mock('../../services/accounts.service');
jest.mock('../../services/password-manager.service');

describe('PasswordsMatch', () => {
  let passwordsMatch: PasswordsMatch;
  let accountsService: AccountsService;
  let passwordManagerService: PasswordManagerService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PasswordsMatch, AccountsService, PasswordManagerService],
    }).compile();

    passwordsMatch = moduleRef.get(PasswordsMatch);
    accountsService = moduleRef.get(AccountsService);
    passwordManagerService = moduleRef.get(PasswordManagerService);
  });

  const password = 'user_pass';

  const mockContext: ExecutionContext = {
    switchToHttp: jest.fn().mockReturnThis(),
    getRequest: jest.fn().mockReturnValue({
      account_credentials: accountDummy(),
      user: jwtPayloadDummy(),
      body: { password },
    }),
  } as unknown as ExecutionContext;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    let result;

    describe('scenario : if passwords match ', () => {
      beforeEach(async () => {
        result = await passwordsMatch.canActivate(mockContext);
      });

      it('should call accountsService.getCredentialsByID', function () {
        expect(accountsService.getCredentialsByID).toHaveBeenCalledWith(
          jwtPayloadDummy().sub,
        );
      });

      it('should call passwordManagerService.comparePassword', function () {
        expect(passwordManagerService.comparePassword).toHaveBeenCalledWith(
          password,
          accountDummy().password,
        );
      });

      it('should return true', function () {
        expect(result).toBe(true);
      });
    });

    describe('scenario : passwords do not match ', () => {
      beforeEach(async () => {
        result = await passwordsMatch.canActivate(mockContext);
      });

      it('should call accountsService.getCredentialsByID', function () {
        expect(accountsService.getCredentialsByID).toHaveBeenCalledWith(
          jwtPayloadDummy().sub,
        );
      });

      it('should call passwordManagerService.comparePassword', function () {
        expect(passwordManagerService.comparePassword).toHaveBeenCalledWith(
          password,
          accountDummy().password,
        );
      });

      it('should throw a ForbiddenException', async function () {
        jest
          .spyOn(passwordManagerService, 'comparePassword')
          .mockResolvedValue(false);

        await expect(passwordsMatch.canActivate(mockContext)).rejects.toThrow(
          AccountMessages.WRONG_PASSWORD,
        );
      });
    });
  });
});
