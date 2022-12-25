jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { BookmarkMessages } from 'src/bookmarks/enums/bookmark-messages';
import { BookmarkRoutes } from 'src/bookmarks/enums/bookmark-routes';
import { BOOKMARKS_ROUTE } from 'src/lib/constants';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import { PostBookmarks } from 'src/bookmarks/response-dto/post-bookmark.dto';
import * as request from 'supertest';

describe('(GET) post bookmarks', () => {
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

  test("should return an array of post's bookmarks", async () => {
    const user = await helpersService.loginRandomAccount(app);

    const post = await helpersService.createRandomPost(app);

    await helpersService.createRandomBookmark(
      app,
      user.token,
      post.body.data.id,
    );

    const result: {
      body: { data: PostBookmarks; message: BookmarkMessages };
    } = await request(server).get(
      BOOKMARKS_ROUTE + BookmarkRoutes.FIND_POST_BOOKMARKS + post.body.data.id,
    );

    expect(result.body.message).toBe(BookmarkMessages.POST_BOOKMARKS_FOUND);
  });
});
