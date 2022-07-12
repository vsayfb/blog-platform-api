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

  async function createBookmarkRequest(
    postID: string,
    access_token: string,
  ): Promise<{ data: Bookmark }> {
    const bookmark: { body: { data: Bookmark } } = await request(server)
      .get(PREFIX + BookmarkRoutes.CREATE + postID)
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
        const token = await takeToken();

        const post = await createPost();

        const bookmark = await createBookmarkRequest(post.data.id, token);

        expect(bookmark.data.id).toBeDefined();
      });
    });
  });

  describe('findOne', () => {
    describe('when findOne is called', () => {
      test('should return a bookmark', async () => {
        const token = await takeToken();

        const post = await createPost();

        const bookmark = await createBookmarkRequest(post.data.id, token);

        expect(bookmark.data.id).toBeDefined();
      });
    });
  });

  describe('findPostBookmarks', () => {
    describe('when findPostBookmarks is called', () => {
      test("should return an array of post's bookmarks", async () => {
        const token = await takeToken();

        const post = await createPost();

        await createBookmarkRequest(post.data.id, token);
        await createBookmarkRequest(post.data.id, token);

        const result: { body: { data: Bookmark } } = await request(server).get(
          PREFIX + BookmarkRoutes.FIND_POST_BOOKMARKS + post.data.id,
        );

        expect(result.body.data).toEqual(expect.any(Array));
      });
    });
  });

  describe.only('delete', () => {
    describe('when delete is called', () => {
      describe('scenario : user delete own bookmark', () => {
        test("should return deleted bookmark's id", async () => {
          const token = await takeToken();

          const post = await createPost();

          const bookmark = await createBookmarkRequest(post.data.id, token);

          const deleted = await deleteBookmarkRequest(bookmark.data.id, token);

          expect(deleted.body.id).toEqual(expect.any(String));
        });
      });

      describe("scenario : user delete other user's bookmark", () => {
        test('should return 403 status code', async () => {
          const post = await createPost();

          const token = await takeToken();

          const otherUserToken = await takeToken();

          const bookmark = await createBookmarkRequest(post.data.id, token);

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
