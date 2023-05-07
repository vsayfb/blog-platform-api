import { SignNewJwtToken } from '../../sign-new-jwt.interceptor';
import { Test } from '@nestjs/testing';
import { LocalAuthService } from '../../../../../auth/services/local-auth.service';
import { ExecutionContext } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { accountDummy } from '../../../dummy/accountDummy';
import { AccountMessages } from '../../../enums/account-messages';
import { SelectedAccountFields } from 'src/resources/accounts/types/selected-account-fields';

describe('SignNewJwtToken', () => {
  let signNewJwtToken: SignNewJwtToken;

  let localAuthService = {
    login: jest.fn().mockReturnValue({
      access_token: 'access_token',
      account: accountDummy(),
    }),
  } as unknown as LocalAuthService;

  let moduleRef = {
    get: jest.fn().mockImplementation(() => localAuthService),
  } as unknown as ModuleRef;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SignNewJwtToken,
        { provide: LocalAuthService, useValue: localAuthService },
        { provide: ModuleRef, useValue: moduleRef },
      ],
    }).compile();

    signNewJwtToken = module.get(SignNewJwtToken);
  });

  const mockContext: ExecutionContext = jest
    .fn()
    .mockReturnValue({}) as unknown as ExecutionContext;

  const mockNext = {
    handle: jest.fn(() =>
      of({ data: accountDummy(), message: AccountMessages.UPDATED }),
    ),
  } as any;

  describe('intercept', () => {
    let response: Observable<{
      data: { access_token: string; account: SelectedAccountFields };
      message: AccountMessages;
    }>;

    beforeEach(async () => {
      await signNewJwtToken.onModuleInit();

      response = (await signNewJwtToken.intercept(
        mockContext,
        mockNext,
      )) as any;

      response.subscribe();
    });

    it('should call next.handle', () => {
      expect(mockNext.handle).toHaveBeenCalled();
    });

    it('should localAuthService login', () => {
      expect(localAuthService.login).toHaveBeenCalled();
    });

    it('should return something', () => {
      response.subscribe({
        next: (value) => {
          expect({
            value,
          }).toBeDefined();
        },
      });
    });
  });
});
