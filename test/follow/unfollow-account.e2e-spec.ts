jest.setTimeout(30000);

import { AccountMessages } from 'src/accounts/enums/account-messages';
import { FollowMessages } from 'src/follow/enums/follow-messages';
import { generateFakeUser } from 'test/helpers/utils/generateFakeUser';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import { FOLLOW_ROUTE } from 'src/lib/constants';
import { FollowRoutes } from 'src/follow/enums/follow-routes';

jest.mock('src/gateways/notifications.gateway');

describe('(DELETE) unfollow account', () => {
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

  async function unfollowAccount(
    followerToken: string,
    unfollowedUsername: string,
  ): Promise<{
    body: { data: string; message: FollowMessages };
    statusCode: number;
  }> {
    const unfollow = await request(server)
      .delete(FOLLOW_ROUTE + FollowRoutes.UNFOLLOW + unfollowedUsername)
      .set('Authorization', followerToken);

    return unfollow;
  }

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

  describe.only('scenario : user unfollow an account', () => {
    test('should return the account unfollowed message', async () => {
      const followerUser = await helpersService.loginRandomAccount(app);

      const followedUser = await helpersService.loginRandomAccount(app);

      await request(server)
        .post(FOLLOW_ROUTE + FollowRoutes.FOLLOW + followedUser.user.username)
        .set('Authorization', followerUser.token);

      const result = await unfollowAccount(
        followerUser.token,
        followedUser.user.username,
      );

      expect(result.body.message).toBe(FollowMessages.UNFOLLOWED);
    });
  });
});
