jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { BookmarkMessages } from 'src/bookmarks/enums/bookmark-messages';
import { BookmarkRoutes } from 'src/bookmarks/enums/bookmark-routes';
import { BOOKMARKS_ROUTE } from 'src/lib/constants';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import * as request from 'supertest';

describe('(DELETE) delete', () => {
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

  async function deleteBookmarkRequest(
    bookmarkID: string,
    token: string,
  ): Promise<{
    body: {
      id: string;
      message: string;
    };
    statusCode: number;
  }> {
    const deleted: {
      body: { id: string; message: string };
      statusCode: number;
    } = await request(server)
      .delete(BOOKMARKS_ROUTE + BookmarkRoutes.DELETE + bookmarkID)
      .set('Authorization', token);

    return deleted;
  }

  describe('scenario : user delete own bookmark', () => {
    test("should return deleted bookmark's id", async () => {
      const user = await helpersService.loginRandomAccount(app);

      const bookmark = await helpersService.createRandomBookmark(
        app,
        user.token,
      );

      const deletedBookmark = await deleteBookmarkRequest(
        bookmark.data.id,
        user.token,
      );

      expect(deletedBookmark.body.message).toBe(BookmarkMessages.DELETED);
    });
  });

  describe("scenario : user delete other user's bookmark", () => {
    test('should return 403 status code', async () => {
      const user = await helpersService.loginRandomAccount(app);

      const forbiddenUser = await helpersService.loginRandomAccount(app);

      const bookmark = await helpersService.createRandomBookmark(
        app,
        user.token,
      );

      const deleted = await deleteBookmarkRequest(
        bookmark.data.id,
        forbiddenUser.token,
      );

      expect(deleted.statusCode).toBe(403);
    });
  });
});
