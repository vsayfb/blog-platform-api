import { CheckClientIsFollowing } from '../../check-client-is-following.interceptor';
import { ModuleRef } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { FollowService } from '../../../../follow/follow.service';
import { ExecutionContext } from '@nestjs/common';
import { accountDummy } from '../../../dummy/accountDummy';
import { map, Observable, of } from 'rxjs';
import { JwtPayload } from '../../../../../lib/jwt.payload';
import { AccountMessages } from '../../../enums/account-messages';
import { followDummy } from '../../../../follow/dummy/follow-dummy';
import { jwtPayloadDummy } from '../../../../../auth/dummy/jwt-payload.dummy';

describe('CheckClientIsFollowing', () => {
  let checkClientIsFollowing: CheckClientIsFollowing;
  let followService: FollowService;
  let moduleRef: ModuleRef;

  beforeAll(async () => {
    followService = {
      getFollow: jest.fn().mockResolvedValue({
        ...followDummy(),
        subscriptions: { mails_turned_on: true, notifications_turned_on: true },
      }),
    } as unknown as FollowService;

    moduleRef = {
      get: jest.fn().mockImplementation(() => followService),
    } as unknown as ModuleRef;

    const module = await Test.createTestingModule({
      providers: [
        CheckClientIsFollowing,
        { provide: FollowService, useValue: followService },
        {
          provide: ModuleRef,
          useValue: moduleRef,
        },
      ],
    }).compile();

    checkClientIsFollowing = module.get(CheckClientIsFollowing);
  });

  const mockContext = function ({
    client,
  }: {
    client: JwtPayload | null;
  }): ExecutionContext {
    return {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue({
        user: client,
      }),
    } as any;
  };

  const mockNext = {
    handle: jest.fn(() =>
      of({ data: accountDummy(), message: AccountMessages.FOUND }),
    ),
  } as any;

  describe('intercept ', function () {
    describe('scenario : client (user) is null', () => {
      let context = mockContext({ client: null });

      beforeEach(async () => {
        await checkClientIsFollowing.onModuleInit();

        const response = await checkClientIsFollowing.intercept(
          context,
          mockNext,
        );

        response.subscribe();
      });

      it('should call context.switchToHttp', () => {
        expect(context.switchToHttp).toHaveBeenCalled();
      });

      it('should call context.getRequest', () => {
        expect(context.switchToHttp().getRequest).toHaveBeenCalled();
      });

      it('should call next.handle', () => {
        expect(mockNext.handle).toHaveBeenCalled();
      });
    });

    describe('scenario : client (user) is not null (logged in)', () => {
      let context = mockContext({ client: jwtPayloadDummy() });

      let res: Observable<any>;

      beforeEach(async () => {
        await checkClientIsFollowing.onModuleInit();

        res = checkClientIsFollowing.intercept(context, mockNext);

        res.subscribe();
      });

      it('should call context.switchToHttp', () => {
        expect(context.switchToHttp).toHaveBeenCalled();
      });

      it('should call context.getRequest', () => {
        expect(context.switchToHttp().getRequest).toHaveBeenCalled();
      });

      it('should call next.handle', () => {
        expect(mockNext.handle).toHaveBeenCalled();
      });

      it('should call followService.getFollow', () => {
        expect(followService.getFollow).toHaveBeenCalled();
      });

      it('should return something', () => {
        res.subscribe({
          next: (value) => {
            expect(value.message).toBeDefined();

            expect(value.data).toBeDefined();
          },
        });
      });
    });
  });
});
