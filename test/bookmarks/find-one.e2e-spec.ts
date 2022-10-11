jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { Bookmark } from 'src/bookmarks/entities/bookmark.entity';
import { BookmarkMessages } from 'src/bookmarks/enums/bookmark-messages';
import { BookmarkRoutes } from 'src/bookmarks/enums/bookmark-routes';
import { BOOKMARKS_ROUTE } from 'src/lib/constants';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import * as request from 'supertest';

describe('(GET) find one', () => {
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

  async function readBookmarkRequest(
    bookmarkID: string,
    token: string,
  ): Promise<{
    body: { data: Bookmark; message: BookmarkMessages };
    statusCode: number;
  }> {
    const bookmark: {
      body: { data: Bookmark; message: BookmarkMessages };
      statusCode: number;
    } = await request(server)
      .get(BOOKMARKS_ROUTE + BookmarkRoutes.FIND_ONE + bookmarkID)
      .set('Authorization', token);

    return bookmark;
  }

  describe('scenario : user read own bookmark', () => {
    test('should return a bookmark', async () => {
      const user = await helpersService.loginRandomAccount(app);

      const bookmark = await helpersService.createRandomBookmark(
        app,
        user.token,
      );

      const result = await readBookmarkRequest(bookmark.data.id, user.token);

      expect(result.body.message).toBe(BookmarkMessages.FOUND);
    });
  });

  describe("scenario : user read other user's  bookmark", () => {
    test('should return 403 status code', async () => {
      const user = await helpersService.loginRandomAccount(app);

      const bookmark = await helpersService.createRandomBookmark(
        app,
        user.token,
      );

      const forbbiddenUser = await helpersService.loginRandomAccount(app);

      const result = await readBookmarkRequest(
        bookmark.data.id,
        forbbiddenUser.token,
      );

      expect(result.statusCode).toBe(403);
    });
  });
});
