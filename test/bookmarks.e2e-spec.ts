import { INestApplication } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { AccountBookmarks } from 'src/bookmarks/dto/account-bookmarks.dto';
import { PostBookmarks } from 'src/bookmarks/dto/post-bookmarks.dto';
import { Bookmark } from 'src/bookmarks/entities/bookmark.entity';
import { BookmarkMessages } from 'src/bookmarks/enums/bookmark-messages';
import { BookmarkRoutes } from 'src/bookmarks/enums/bookmark-routes';
import { SelectedBookmarkFields } from 'src/bookmarks/types/selected-bookmark-fields';
import { DatabaseService } from 'src/database/database.service';
import { Post } from 'src/posts/entities/post.entity';
import { PostRoutes } from 'src/posts/enums/post-routes';
import * as request from 'supertest';
import { generateFakePost } from './helpers/faker/generateFakePost';
import { loginAccount } from './helpers/loginAccount';

const PREFIX = '/bookmarks';

describe('Bookmark (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;
  let server: any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    databaseService = moduleRef.get<DatabaseService>(DatabaseService);

    server = app.getHttpServer();

    await app.init();
  });

  afterAll(async () => {
    await databaseService.clearTableRows('bookmark');
    await databaseService.closeDatabase();
  });

  async function takeToken() {
    const user = await databaseService.createRandomTestUser();

    const result = await loginAccount(app, user.username, user.password);

    return 'Bearer ' + result.access_token;
  }

  async function createPost(): Promise<{ data: Post }> {
    const post: { body: { data: Post } } = await request(server)
      .post('/posts' + PostRoutes.CREATE)
      .set('Authorization', await takeToken())
      .send(generateFakePost());

    return post.body;
  }

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
  ): Promise<{ data: SelectedBookmarkFields; message: BookmarkMessages }> {
    const post = await createPost();

    const bookmark: {
      body: { data: SelectedBookmarkFields; message: BookmarkMessages };
    } = await request(server)
      .post(PREFIX + BookmarkRoutes.CREATE + post.data.id)
      .set('Authorization', access_token);

    return bookmark.body;
  }

  async function deleteBookmarkRequest(
    bookmarkID: String,
    access_token: string,
  ): Promise<{
    body: {
      id: string;
      message: string;
    };
    statusCode: number;
  }> {
    const token = access_token || (await takeToken());

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
        const bookmark = await createBookmarkRequest(await takeToken());

        expect(bookmark.message).toBe(BookmarkMessages.CREATED);
      });
    });
  });

  describe('findOne', () => {
    describe('when findOne is called', () => {
      describe('scenario : user read own bookmark', () => {
        test('should return a bookmark', async () => {
          const token = await takeToken();

          const bookmark = await createBookmarkRequest(token);

          const result = await readBookmarkRequest(bookmark.data.id, token);

          expect(result.body.message).toBe(BookmarkMessages.FOUND);
        });
      });

      describe("scenario : user read other user's  bookmark", () => {
        test('should return 403 status code', async () => {
          const token = await takeToken();

          const bookmark = await createBookmarkRequest(token);

          const otherUserToken = await takeToken();

          const result = await readBookmarkRequest(
            bookmark.data.id,
            otherUserToken,
          );

          expect(result.statusCode).toBe(403);
        });
      });
    });
  });

  describe('findPostBookmarks', () => {
    describe('when findPostBookmarks is called', () => {
      test("should return an array of post's bookmarks", async () => {
        const token = await takeToken();

        const createdBookmark = await createBookmarkRequest(token);

        const bookmark = await readBookmarkRequest(
          createdBookmark.data.id,
          token,
        );

        const result: {
          body: { data: PostBookmarks; message: BookmarkMessages };
        } = await request(server).get(
          PREFIX +
            BookmarkRoutes.FIND_POST_BOOKMARKS +
            bookmark.body.data.post.id,
        );

        expect(result.body.message).toBe(BookmarkMessages.POST_BOOKMARKS_FOUND);
      });
    });
  });

  describe('findMyBookmarks', () => {
    describe('when findMyBookmarks is called', () => {
      test("should return an array of user's bookmarks", async () => {
        const me = await takeToken();

        await createBookmarkRequest(me);

        const result: {
          body: { data: AccountBookmarks; message: BookmarkMessages };
        } = await request(server)
          .get(PREFIX + BookmarkRoutes.FIND_MY_BOOKMARKS)
          .set('Authorization', me);

        expect(result.body.message).toBe(BookmarkMessages.ALL_FOUND);
      });
    });
  });

  describe('delete', () => {
    describe('when delete is called', () => {
      describe('scenario : user delete own bookmark', () => {
        test("should return deleted bookmark's id", async () => {
          const token = await takeToken();

          const bookmark = await createBookmarkRequest(token);

          const deleted = await deleteBookmarkRequest(bookmark.data.id, token);

          expect(deleted.body.message).toBe(BookmarkMessages.DELETED);
        });
      });

      describe("scenario : user delete other user's bookmark", () => {
        test('should return 403 status code', async () => {
          const token = await takeToken();

          const otherUserToken = await takeToken();

          const bookmark = await createBookmarkRequest(token);

          const deleted = await deleteBookmarkRequest(
            bookmark.data.id,
            otherUserToken,
          );

          expect(deleted.statusCode).toBe(403);
        });
      });
    });
  });
});
