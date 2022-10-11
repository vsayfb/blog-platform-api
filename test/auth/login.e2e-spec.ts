jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { AuthMessages } from 'src/auth/enums/auth-messages';
import { AuthRoutes } from 'src/auth/enums/auth-routes';
import { AUTH_ROUTE } from 'src/lib/constants';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import * as request from 'supertest';

describe('(POST) login', () => {
  let app: INestApplication;
  let databaseService: TestDatabaseService;
  let server: any;

  beforeAll(async () => {
    const { nestApp, database } = await initializeEndToEndTestModule();

    app = nestApp;
    databaseService = database;
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await databaseService.clearAllTables();
    await databaseService.disconnectDatabase();
    await app.close();
  });

  test('should return an access_token', async () => {
    const user = await databaseService.createRandomTestUser();

    const result: {
      body: {
        data: { access_token: string };
        message: AuthMessages;
      };
    } = await request(server)
      .post(AUTH_ROUTE + AuthRoutes.LOGIN)
      .send(user);

    expect(result.body.message).toBe(AuthMessages.SUCCESSFUL_LOGIN);
  });
});
