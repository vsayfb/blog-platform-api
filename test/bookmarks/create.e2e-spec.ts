jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { BookmarkMessages } from 'src/bookmarks/enums/bookmark-messages';
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

  test('should return the created bookmark', async () => {
    const user = await helpersService.loginRandomAccount(app);

    const bookmark = await helpersService.createRandomBookmark(app, user.token);

    expect(bookmark.message).toBe(BookmarkMessages.CREATED);
  });
});
