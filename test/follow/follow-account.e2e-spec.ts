jest.setTimeout(30000);

import { AccountMessages } from 'src/accounts/enums/account-messages';
import { FollowMessages } from 'src/follow/enums/follow-messages';
import { generateFakeUser } from 'test/helpers/utils/generateFakeUser';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import { Follow } from 'src/follow/entities/follow.entity';
import { FOLLOW_ROUTE } from 'src/lib/constants';
import { FollowRoutes } from 'src/follow/enums/follow-routes';

jest.mock('src/gateways/notifications.gateway');

describe('(POST) follow account', () => {
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
      .post(FOLLOW_ROUTE + FollowRoutes.FOLLOW + followedUsername)
      .set('Authorization', followerToken);

    return follow;
  }

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

      expect(result.body.message).toBe(FollowMessages.CANNOT_FOLLOW_YOURSELF);
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
      const notification: { body: { data: Notification[] } } = await request(
        server,
      )
        .get('/notifications/me')
        .set('Authorization', followedUserToken);

      expect(notification.body.data.length).toBe(1);
    });
  });
});
