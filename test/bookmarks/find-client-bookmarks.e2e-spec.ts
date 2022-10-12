jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { BookmarkMessages } from 'src/bookmarks/enums/bookmark-messages';
import { BookmarkRoutes } from 'src/bookmarks/enums/bookmark-routes';
import { BOOKMARKS_ROUTE } from 'src/lib/constants';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import * as request from 'supertest';
import { AccountBookmarks } from 'src/bookmarks/dto/account-bookmarks.dto';

describe('(GET) client bookmarks', () => {
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

  test("should return an array of client's bookmarks", async () => {
    const me = await helpersService.loginRandomAccount(app);

    await helpersService.createRandomBookmark(app, me.token);

    const result: {
      body: { data: AccountBookmarks; message: BookmarkMessages };
    } = await request(server)
      .get(BOOKMARKS_ROUTE + BookmarkRoutes.FIND_CLIENT_BOOKMARKS)
      .set('Authorization', me.token);

    expect(result.body.message).toBe(BookmarkMessages.ALL_FOUND);
  });
});
