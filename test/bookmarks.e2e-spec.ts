jest.setTimeout(30000);
import { INestApplication } from '@nestjs/common';
import { AccountBookmarks } from 'src/bookmarks/dto/account-bookmarks.dto';
import { PostBookmarks } from 'src/bookmarks/dto/post-bookmarks.dto';
import { Bookmark } from 'src/bookmarks/entities/bookmark.entity';
import { BookmarkMessages } from 'src/bookmarks/enums/bookmark-messages';
import { BookmarkRoutes } from 'src/bookmarks/enums/bookmark-routes';
import { SelectedBookmarkFields } from 'src/bookmarks/types/selected-bookmark-fields';
import * as request from 'supertest';
import { TestDatabaseService } from './database/database.service';
import { HelpersService } from './helpers/helpers.service';
import { initializeEndToEndTestModule } from './utils/initializeEndToEndTestModule';

const PREFIX = '/bookmarks';

describe('Bookmark (e2e)', () => {
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

  afterEach(async () => {
    await databaseService.clearAllTables();
  });

  afterAll(async () => {
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
      .get(PREFIX + BookmarkRoutes.FIND_ONE + bookmarkID)
      .set('Authorization', token);

    return bookmark;
  }

  async function createBookmarkRequest(
    access_token: string,
    postID?: string,
  ): Promise<{ data: SelectedBookmarkFields; message: BookmarkMessages }> {
    const post = await helpersService.createRandomPost(app);

    const bookmark: {
      body: { data: SelectedBookmarkFields; message: BookmarkMessages };
    } = await request(server)
      .post(PREFIX + BookmarkRoutes.CREATE + `${postID || post.body.data.id}`)
      .set('Authorization', access_token);

    return bookmark.body;
  }

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
      .delete(PREFIX + BookmarkRoutes.REMOVE + bookmarkID)
      .set('Authorization', token);

    return deleted;
  }

  describe('create', () => {
    describe('when create is called', () => {
      test('should return the created bookmark', async () => {
        const user = await helpersService.loginRandomAccount(app);

        const bookmark = await createBookmarkRequest(user.token);

        expect(bookmark.message).toBe(BookmarkMessages.CREATED);
      });
    });
  });

  describe('findOne', () => {
    describe('when findOne is called', () => {
      describe('scenario : user read own bookmark', () => {
        test('should return a bookmark', async () => {
          const user = await helpersService.loginRandomAccount(app);

          const bookmark = await createBookmarkRequest(user.token);

          const result = await readBookmarkRequest(
            bookmark.data.id,
            user.token,
          );

          expect(result.body.message).toBe(BookmarkMessages.FOUND);
        });
      });

      describe("scenario : user read other user's  bookmark", () => {
        test('should return 403 status code', async () => {
          const user = await helpersService.loginRandomAccount(app);

          const bookmark = await createBookmarkRequest(user.token);

          const forbbiddenUser = await helpersService.loginRandomAccount(app);

          const result = await readBookmarkRequest(
            bookmark.data.id,
            forbbiddenUser.token,
          );

          expect(result.statusCode).toBe(403);
        });
      });
    });
  });

  describe('findPostBookmarks', () => {
    describe('when findPostBookmarks is called', () => {
      test("should return an array of post's bookmarks", async () => {
        const user = await helpersService.loginRandomAccount(app);

        const post = await helpersService.createRandomPost(app);

        await createBookmarkRequest(user.token, post.body.data.id);

        const result: {
          body: { data: PostBookmarks; message: BookmarkMessages };
        } = await request(server).get(
          PREFIX + BookmarkRoutes.FIND_POST_BOOKMARKS + post.body.data.id,
        );

        expect(result.body.message).toBe(BookmarkMessages.POST_BOOKMARKS_FOUND);
      });
    });
  });

  describe('findMyBookmarks', () => {
    describe('when findMyBookmarks is called', () => {
      test("should return an array of user's bookmarks", async () => {
        const me = await helpersService.loginRandomAccount(app);

        await createBookmarkRequest(me.token);

        const result: {
          body: { data: AccountBookmarks; message: BookmarkMessages };
        } = await request(server)
          .get(PREFIX + BookmarkRoutes.FIND_MY_BOOKMARKS)
          .set('Authorization', me.token);

        expect(result.body.message).toBe(BookmarkMessages.ALL_FOUND);
      });
    });
  });

  describe('delete', () => {
    describe('when delete is called', () => {
      describe('scenario : user delete own bookmark', () => {
        test("should return deleted bookmark's id", async () => {
          const user = await helpersService.loginRandomAccount(app);

          const bookmark = await createBookmarkRequest(user.token);

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

          const bookmark = await createBookmarkRequest(user.token);

          const deleted = await deleteBookmarkRequest(
            bookmark.data.id,
            forbiddenUser.token,
          );

          expect(deleted.statusCode).toBe(403);
        });
      });
    });
  });
});
