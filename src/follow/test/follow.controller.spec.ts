import { Test, TestingModule } from '@nestjs/testing';
import { accountStub } from 'src/accounts/test/stub/account.stub';
import { jwtPayloadStub } from 'src/auth/stub/jwt-payload.stub';
import { UserFollowed } from '../dto/user-followed.dto';
import { UserFollowers } from '../dto/user-followers.dto';
import { Follow } from '../entities/follow.entity';
import { FollowMessages } from '../enums/follow-messages';
import { FollowController } from '../follow.controller';
import { FollowService } from '../follow.service';
import { FollowedNotificationInterceptor } from '../interceptors/followed-notification.interceptor';

jest.mock('src/follow/follow.service');

describe('FollowController', () => {
  let followController: FollowController;
  let followService: FollowService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FollowController],
      providers: [FollowService],
    })
      .overrideInterceptor(FollowedNotificationInterceptor)
      .useValue({})
      .compile();

    followController = module.get<FollowController>(FollowController);
    followService = module.get<FollowService>(FollowService);
  });

  describe('follow', () => {
    describe('when follow is called', () => {
      let result: { data: Follow; message?: FollowMessages };
      const account = jwtPayloadStub();
      const followedUsername = accountStub().username;

      beforeEach(async () => {
        result = await followController.follow(account, followedUsername);
      });

      test('calls followService.followAccount', () => {
        expect(followService.followAccount).toHaveBeenCalledWith(
          account.sub,
          followedUsername,
        );
      });

      it('should return followedUsername', () => {
        expect(result.data).toBe(followedUsername);
      });
    });
  });

  describe('unfollow', () => {
    describe('when unfollow is called', () => {
      let result: { data: string; message: FollowMessages };
      const account = jwtPayloadStub();
      const followedUsername = accountStub().username;

      beforeEach(async () => {
        result = await followController.unfollow(account, followedUsername);
      });

      test('calls followService.unfollowAccount', () => {
        expect(followService.unfollowAccount).toHaveBeenCalledWith(
          account.username,
          followedUsername,
        );
      });

      it('should return unfollowedUsername', () => {
        expect(result.data).toBe(followedUsername);
      });
    });
  });

  describe('findUserFollowers', () => {
    describe('when findUserFollowers is called', () => {
      let result: { data: UserFollowers; message: FollowMessages };
      const username = accountStub().username;

      beforeEach(async () => {
        result = await followController.findUserFollowers(username);
      });

      test('calls followService.getUserFollowers', () => {
        expect(followService.getUserFollowers).toHaveBeenCalledWith(username);
      });

      it("should return an array of user's followers", () => {
        expect(result.data).toEqual([
          {
            follower: accountStub(),
            id: expect.any(String),
            createdAt: expect.any(Date),
          },
        ]);
      });
    });
  });

  describe('findUserFollowed', () => {
    describe('when findUserFollowed is called', () => {
      let result: { data: UserFollowed; message: FollowMessages };
      const username = accountStub().username;

      beforeEach(async () => {
        result = await followController.findUserFollowed(username);
      });

      test('calls followService.getUserFollowed', () => {
        expect(followService.getUserFollowed).toHaveBeenCalledWith(username);
      });

      it("should return an array of user's followed", () => {
        expect(result.data).toEqual([
          {
            followed: accountStub(),
            id: expect.any(String),
            createdAt: expect.any(Date),
          },
        ]);
      });
    });
  });
});
