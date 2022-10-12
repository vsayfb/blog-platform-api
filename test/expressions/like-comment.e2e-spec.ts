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
import { CreatedCommentExpressionDto } from 'src/expressions/dto/created-comment-expression.dto';

jest.mock('src/gateways/notifications.gateway');

describe('(POST) like comment', () => {
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

  async function likeComment(
    token: string,
    commentID?: string,
  ): Promise<{
    data: CreatedCommentExpressionDto;
    message: ExpressionMessages;
  }> {
    const comment = await helpersService.createRandomComment(app);

    const result = await request(server)
      .post(
        EXPRESSIONS_ROUTE +
          ExpressionRoutes.LIKE_TO_COMMENT +
          (commentID || comment.body.data.id),
      )
      .set('Authorization', token);

    return result.body;
  }

  describe('when likeComment is called', () => {
    let user: { token: string; user: DatabaseUser };
    let commentID: string;

    beforeAll(async () => {
      user = await helpersService.loginRandomAccount(app);
    });

    describe('scenario : user leaves an expression on comment', () => {
      test('should return the created expression', async () => {
        const result = await likeComment(user.token);

        commentID = result.data.comment.id;

        expect(result.message).toBe(ExpressionMessages.CREATED);
      });
    });

    describe('scenario : user leaves again an expression on comment', () => {
      test('should return the created expression', async () => {
        const result = await likeComment(user.token, commentID);

        expect(result.message).toBe(ExpressionMessages.ALREADY_LEFT);
      });
    });
  });
});
