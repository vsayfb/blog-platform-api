import { INestApplication } from '@nestjs/common';
import { TestDatabaseService } from './database/database.service';
import { HelpersService } from './helpers/helpers.service';
import { initializeEndToEndTestModule } from './utils/initializeEndToEndTestModule';
import * as request from 'supertest';
import { ExpressionRoutes } from 'src/expressions/enums/expression-routes';
import { ExpressionMessages } from 'src/expressions/enums/expressions-messages';
import { AccountExpressionsDto } from 'src/expressions/dto/account-expressions.dto';
import { CreatedPostExpressionDto } from 'src/expressions/dto/created-post-expression.dto';

const PREFIX = '/expressions';

describe('Expressions (e2e)', () => {
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
  });

  async function likePost(token: string) {
    const post = await helpersService.createRandomPost(app);

    const result: {
      body: {
        data: CreatedPostExpressionDto;
        message: ExpressionMessages;
      };
    } = await request(server)
      .post(PREFIX + ExpressionRoutes.LIKE_TO_POST + post.body.data.id)
      .set('Authorization', token);

    return result.body;
  }

  async function removeExpression(id: string, token: string) {
    const result: {
      body: {
        id: string;
        message: ExpressionMessages;
      };
    } = await request(server)
      .delete(PREFIX + ExpressionRoutes.REMOVE + id)
      .set('Authorization', token);

    return result.body;
  }

  describe('findMyExpressions', () => {
    describe('when findMyExpressions is called', () => {
      test('should return an array of expressions', async () => {
        const me = await helpersService.loginRandomAccount(app);

        await likePost(me.token);

        const result: {
          body: { data: AccountExpressionsDto[]; message: ExpressionMessages };
        } = await request(server)
          .get(PREFIX + ExpressionRoutes.ME)
          .set('Authorization', me.token);

        expect(result.body.message).toBe(ExpressionMessages.ALL_FOUND);
      });
    });
  });

  describe('likePost', () => {
    describe('when likePost is called', () => {
      test('should return the created expression', async () => {
        const me = await helpersService.loginRandomAccount(app);

        const result = await likePost(me.token);

        expect(result.message).toBe(ExpressionMessages.CREATED);
      });
    });
  });

  describe('remove', () => {
    describe('when remove is called', () => {
      describe('scenario : if user remove another user expression', () => {
        test('should throw Forbidden', async () => {
          const user = await helpersService.loginRandomAccount(app);
          const anotherUser = await helpersService.loginRandomAccount(app);

          const created = await likePost(user.token);

          const result = await removeExpression(
            created.data.id,
            anotherUser.token,
          );

          expect(result.message).toBe('Forbidden resource');
        });
      });

      describe('scenario : if user remove own expression', () => {
        test('should return removed message', async () => {
          const user = await helpersService.loginRandomAccount(app);

          const created = await likePost(user.token);

          const result = await removeExpression(created.data.id, user.token);

          expect(result.message).toBe(ExpressionMessages.DELETED);
        });
      });
    });
  });
});
