import { INestApplication } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { Bookmark } from 'src/bookmarks/entities/bookmark.entity';
import { BookmarkRoutes } from 'src/bookmarks/enums/bookmark-routes';
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
  ): Promise<{ body: { data: Bookmark }; statusCode: number }> {
    const bookmark: { body: { data: Bookmark }; statusCode: number } =
      await request(server)
        .get(PREFIX + BookmarkRoutes.FIND_ONE + bookmarkID)
        .set('Authorization', token);

    return bookmark;
  }

  async function createBookmarkRequest(
    access_token: string,
  ): Promise<{ data: Bookmark }> {
    const post = await createPost();

    const bookmark: { body: { data: Bookmark } } = await request(server)
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
    };
    statusCode: number;
  }> {
    const token = access_token || (await takeToken());

    const deleted: { body: { id: string }; statusCode: number } = await request(
      server,
    )
      .delete(PREFIX + BookmarkRoutes.REMOVE + bookmarkID)
      .set('Authorization', token);

    return deleted;
  }

  describe('create', () => {
    describe('when create is called', () => {
      test('should return the created bookmark', async () => {
        const bookmark = await createBookmarkRequest(await takeToken());

        expect(bookmark.data.id).toEqual(expect.any(String));
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

          expect(result.body.data.id).toEqual(expect.any(String));
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
        const bookmark = await createBookmarkRequest(await takeToken());

        const result: { body: { data: Bookmark[] } } = await request(
          server,
        ).get(
          PREFIX + BookmarkRoutes.FIND_POST_BOOKMARKS + bookmark.data.post.id,
        );

        expect(result.body.data).toEqual(expect.any(Array));
      });
    });
  });

  describe('findMyBookmarks', () => {
    describe('when findMyBookmarks is called', () => {
      test("should return an array of user's bookmarks", async () => {
        const me = await takeToken();

        const bookmark = await createBookmarkRequest(me);

        const result: { body: { data: Bookmark[] } } = await request(server)
          .get(PREFIX + BookmarkRoutes.FIND_MY_BOOKMARKS)
          .set('Authorization', me);

        expect(result.body.data[0].id).toEqual(bookmark.data.id);
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

          expect(deleted.body.id).toEqual(expect.any(String));
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
