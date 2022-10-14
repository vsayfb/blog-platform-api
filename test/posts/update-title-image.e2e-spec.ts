import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PostMessages } from 'src/posts/enums/post-messages';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import { POSTS_ROUTE } from 'src/lib/constants';
import { PostRoutes } from 'src/posts/enums/post-routes';
import { Role } from 'src/accounts/entities/account.entity';

jest.setTimeout(30000);

describe('/ (PUT) update title image', () => {
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

  async function updateTitleImage(
    id: string,
    accessToken: string,
    titleImagePath?: string,
  ): Promise<{ data: string; message: PostMessages }> {
    let result;

    if (titleImagePath) {
      const { body } = await request(server)
        .put(POSTS_ROUTE + PostRoutes.UPDATE_TITLE_IMAGE + id)
        .set('Authorization', accessToken)
        .attach('titleImage', titleImagePath);

      result = body;
    } else {
      const { body } = await request(server)
        .put(POSTS_ROUTE + PostRoutes.UPDATE_TITLE_IMAGE + id)
        .set('Authorization', accessToken);

      result = body;
    }

    return result;
  }

  describe('scenario : user change its own post post title image', () => {
    describe('user sends a file for updating title image', () => {
      it('should return the new title image url', async () => {
        const author = await helpersService.loginRandomAccount(app);

        const createdPost = await helpersService.createRandomPost(
          app,
          Role.USER,
          author.token,
        );

        const updated = await updateTitleImage(
          createdPost.body.data.id,
          author.token,
          'src/lib/barisabi.jpg',
        );

        expect(updated.data).toEqual(expect.any(String));

        expect(updated.message).toBe(PostMessages.TITLE_IMAGE_UPDATED);
      });
    });

    describe("user doesn't send a file for removing title image", () => {
      it('should return the null as an image url', async () => {
        const author = await helpersService.loginRandomAccount(app);

        const createdPost = await helpersService.createRandomPost(
          app,
          Role.USER,
          author.token,
        );

        const updated = await updateTitleImage(
          createdPost.body.data.id,
          author.token,
        );

        expect(updated.message).toBe(PostMessages.TITLE_IMAGE_UPDATED);
      });
    });
  });

  describe("scenario : user change another user's post status", () => {
    it('should throw Forbidden Error', async () => {
      const author = await helpersService.loginRandomAccount(app);

      const createdPost = await helpersService.createRandomPost(
        app,
        Role.USER,
        author.token,
      );

      const forbiddenUser = await helpersService.loginRandomAccount(app);

      const updated = await updateTitleImage(
        createdPost.body.data.id,
        forbiddenUser.token,
      );

      expect(updated.message).toBe('Forbidden resource');
    });
  });
});
