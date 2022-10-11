jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { TagMessages } from 'src/tags/enums/tag-messages';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';

describe('(POST) create', () => {
  let app: INestApplication;
  let databaseService: TestDatabaseService;
  let helpersService: HelpersService;

  beforeAll(async () => {
    const { nestApp, database, helpers } = await initializeEndToEndTestModule();

    app = nestApp;
    helpersService = helpers;
    databaseService = database;
  });

  afterAll(async () => {
    await databaseService.clearAllTables();
    await databaseService.disconnectDatabase();
    await app.close();
  });

  describe('scenario : if user is just a user', () => {
    it('should can not create a tag', async () => {
      const account = await helpersService.loginRandomAccount(app);

      const result = await helpersService.createRandomTag(
        app,
        account.user.role,
      );

      expect(result.statusCode).toBe(403);
    });
  });

  describe('scenario : if user is a moderator', () => {
    it('should can create a tag', async () => {
      const result = await helpersService.createRandomTag(app);

      expect(result.body.message).toBe(TagMessages.CREATED);
    });
  });
});
