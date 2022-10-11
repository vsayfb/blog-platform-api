jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { FollowMessages } from 'src/follow/enums/follow-messages';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import { FollowRoutes } from 'src/follow/enums/follow-routes';
import { FOLLOW_ROUTE } from 'src/lib/constants';
import * as request from 'supertest';
import { UserFollowed } from 'src/follow/dto/user-followed.dto';

jest.mock('src/gateways/notifications.gateway');

describe('(GET) find account followers', () => {
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
        data: UserFollowed;
        message: FollowMessages;
      };
    } = await request(server).get(
      FOLLOW_ROUTE + FollowRoutes.USER_FOLLOWED + user.user.username,
    );

    expect(result.body.message).toBe(FollowMessages.FOLLOWED_FOUND);
  });
});
