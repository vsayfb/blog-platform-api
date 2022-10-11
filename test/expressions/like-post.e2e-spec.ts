jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { ExpressionRoutes } from 'src/expressions/enums/expression-routes';
import { ExpressionMessages } from 'src/expressions/enums/expressions-messages';
import { EXPRESSIONS_ROUTE } from 'src/lib/constants';
import {
  DatabaseUser,
  TestDatabaseService,
} from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import * as request from 'supertest';
import { CreatedPostDto } from 'src/posts/dto/created-post.dto';
import { CreatedPostExpressionDto } from 'src/expressions/dto/created-post-expression.dto';

jest.mock('src/gateways/notifications.gateway');

describe('(POST) like post', () => {
  let app: INestApplication;
  let helpersService: HelpersService;
  let databaseService: TestDatabaseService;
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

  async function likePost(
    token: string,
    postID?: string,
  ): Promise<{
    data: CreatedPostExpressionDto;
    message: ExpressionMessages;
  }> {
    let post: { body: { data: CreatedPostDto; message: string } };

    if (!postID) post = await helpersService.createRandomPost(app);

    const result = await request(server)
      .post(
        EXPRESSIONS_ROUTE +
          ExpressionRoutes.LIKE_TO_POST +
          (postID || post.body.data.id),
      )
      .set('Authorization', token);

    return result.body;
  }

  describe('when likePost is called', () => {
    let user: { token: string; user: DatabaseUser };
    let postID: string;

    beforeAll(async () => {
      user = await helpersService.loginRandomAccount(app);
    });

    describe('scenario : user leaves an expression on post', () => {
      test('should return the created expression', async () => {
        const result = await likePost(user.token);

        postID = result.data.post.id;

        expect(result.message).toBe(ExpressionMessages.CREATED);
      });
    });

    describe('scenario : user leaves again an expression on post', () => {
      test('should return the created expression', async () => {
        const result = await likePost(user.token, postID);

        expect(result.message).toBe(ExpressionMessages.ALREADY_LEFT);
      });
    });
  });
});
