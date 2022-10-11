jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { UserFollowers } from 'src/follow/dto/user-followers.dto';
import { FollowMessages } from 'src/follow/enums/follow-messages';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import { FollowRoutes } from 'src/follow/enums/follow-routes';
import { FOLLOW_ROUTE } from 'src/lib/constants';
import * as request from 'supertest';

jest.mock('src/gateways/notifications.gateway');

describe('(GET) find account followed', () => {
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

  test("should return an array of user's followed", async () => {
    const user = await helpersService.loginRandomAccount(app);

    const result: {
      body: {
        data: UserFollowers;
        message: FollowMessages;
      };
    } = await request(server).get(
      FOLLOW_ROUTE + FollowRoutes.USER_FOLLOWERS + user.user.username,
    );

    expect(result.body.message).toBe(FollowMessages.FOLLOWERS_FOUND);
  });
});
