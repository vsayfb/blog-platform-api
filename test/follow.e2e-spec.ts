jest.setTimeout(30000);
import { INestApplication } from '@nestjs/common';
import { AccountMessages } from 'src/accounts/enums/account-messages';
import { UserFollowed } from 'src/follow/dto/user-followed.dto';
import { UserFollowers } from 'src/follow/dto/user-followers.dto';
import { Follow } from 'src/follow/entities/follow.entity';
import { FollowMessages } from 'src/follow/enums/follow-messages';
import { FollowRoutes } from 'src/follow/enums/follow-routes';
import { Notification } from 'src/global/notifications/entities/notification.entity';
import * as request from 'supertest';
import { TestDatabaseService } from './database/database.service';
import { HelpersService } from './helpers/helpers.service';
import { generateFakeUser } from './utils/generateFakeUser';
import { initializeEndToEndTestModule } from './utils/initializeEndToEndTestModule';

jest.mock('src/gateways/notifications.gateway');

const PREFIX = '/follow';

describe('Follow (e2e)', () => {
  let app: INestApplication;
  let databaseService: TestDatabaseService;
  let helpersService: HelpersService;
  let server: any;

  beforeAll(async () => {
    const { nestApp, database, helpers } = await initializeEndToEndTestModule();

    app = nestApp;
    helpersService = helpers;
    databaseService = database;
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await databaseService.clearAllTables();

    await databaseService.disconnectDatabase();
    await app.close();
  });

  async function followAccount(
    followerToken: string,
    followedUsername: string,
  ): Promise<{
    body: { data: Follow; message: FollowMessages };
    statusCode: number;
  }> {
    const follow = await request(server)
      .post(PREFIX + FollowRoutes.FOLLOW + followedUsername)
      .set('Authorization', followerToken);

    return follow;
  }

  async function unfollowAccount(
    followerToken: string,
    unfollowedUsername: string,
  ): Promise<{
    body: { data: string; message: FollowMessages };
    statusCode: number;
  }> {
    const unfollow = await request(server)
      .delete(PREFIX + FollowRoutes.UNFOLLOW + unfollowedUsername)
      .set('Authorization', followerToken);

    return unfollow;
  }

  describe('follow', () => {
    describe('when follow is called', () => {
      describe('scenario : user follows an account that does not exist', () => {
        test('should return Account Not Found', async () => {
          const user = await helpersService.loginRandomAccount(app);

          const result = await followAccount(
            user.token,
            generateFakeUser().username,
          );

          expect(result.body.message).toBe(AccountMessages.NOT_FOUND);
        });
      });

      describe('scenario : user re-follows the user', () => {
        test('should return Already followed message', async () => {
          const user = await helpersService.loginRandomAccount(app);

          const follewedUser = await helpersService.loginRandomAccount(app);

          await followAccount(user.token, follewedUser.user.username);

          const result = await followAccount(
            user.token,
            follewedUser.user.username,
          );

          expect(result.body.message).toBe(FollowMessages.ALREADY_FOLLOWED);
        });
      });

      describe('scenario : user follows ownself', () => {
        test('should return You cannot follow yourself.', async () => {
          const user = await helpersService.loginRandomAccount(app);

          const result = await followAccount(user.token, user.user.username);

          expect(result.body.message).toBe(
            FollowMessages.CANNOT_FOLLOW_YOURSELF,
          );
        });
      });

      describe('scenario : user meets all conditions', () => {
        let followedUserToken: string;

        test("should return the followed account's username.", async () => {
          const user = await helpersService.loginRandomAccount(app);

          const followedUser = await helpersService.loginRandomAccount(app);

          followedUserToken = followedUser.token;

          const result = await followAccount(
            user.token,
            followedUser.user.username,
          );

          expect(result.body.message).toBe(FollowMessages.FOLLOWED);
        });

        test('should be saved a notification about follower user', async () => {
          const notification: { body: { data: Notification[] } } =
            await request(server)
              .get('/notifications/me')
              .set('Authorization', followedUserToken);

          expect(notification.body.data.length).toBe(1);
        });
      });
    });
  });

  describe('unfollow', () => {
    describe('when unfollow is called', () => {
      describe('scenario : user unfollow an account it does not follow', () => {
        test('should return Account Not Found', async () => {
          const user = await helpersService.loginRandomAccount(app);

          const result = await unfollowAccount(
            user.token,
            generateFakeUser().username,
          );

          expect(result.body.message).toBe(AccountMessages.NOT_FOUND);
        });
      });

      describe('scenario : user unfollow an account', () => {
        test("should return the unfollowed account's username", async () => {
          const user = await helpersService.loginRandomAccount(app);

          const followedUser = await helpersService.loginRandomAccount(app);

          await followAccount(user.token, followedUser.user.username);

          const result = await unfollowAccount(
            user.token,
            followedUser.user.username,
          );

          expect(result.body.data).toBe(followedUser.user.username);
          expect(result.body.message).toBe(FollowMessages.UNFOLLOWED);
        });
      });
    });
  });

  describe('findUserFollowers', () => {
    describe('when findUserFollowers is called', () => {
      test("should return an array of user's followers", async () => {
        const user_1 = await helpersService.loginRandomAccount(app);

        const user1_username = user_1.user.username;

        const user_2 = await helpersService.loginRandomAccount(app);

        const user_3 = await helpersService.loginRandomAccount(app);

        await followAccount(user_2.token, user1_username);
        await followAccount(user_3.token, user1_username);

        const user_1_followers: {
          body: {
            data: UserFollowers;
            message: FollowMessages;
          };
        } = await request(server).get(
          PREFIX + FollowRoutes.USER_FOLLOWERS + user1_username,
        );

        expect(user_1_followers.body.data[0].follower.username).toBe(
          user_2.user.username,
        );

        expect(user_1_followers.body.data[1].follower.username).toBe(
          user_3.user.username,
        );

        expect(user_1_followers.body.message).toBe(
          FollowMessages.FOLLOWERS_FOUND,
        );
      });
    });
  });

  describe('findUserFollowed', () => {
    describe('when findUserFollowed is called', () => {
      test("should return an array of user's followed", async () => {
        const user_1 = await helpersService.loginRandomAccount(app);

        const user1_username = user_1.user.username;

        const user_2 = await helpersService.loginRandomAccount(app);

        const user_3 = await helpersService.loginRandomAccount(app);

        await followAccount(user_1.token, user_2.user.username);
        await followAccount(user_1.token, user_3.user.username);

        const user_1_followed: {
          body: {
            data: UserFollowed;
            message: FollowMessages;
          };
        } = await request(server).get(
          PREFIX + FollowRoutes.USER_FOLLOWED + user1_username,
        );

        expect(user_1_followed.body.data[0].followed.username).toBe(
          user_2.user.username,
        );

        expect(user_1_followed.body.data[1].followed.username).toBe(
          user_3.user.username,
        );

        expect(user_1_followed.body.message).toBe(
          FollowMessages.FOLLOWED_FOUND,
        );
      });
    });
  });
});
