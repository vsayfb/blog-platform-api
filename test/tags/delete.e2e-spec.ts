jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { TagMessages } from 'src/tags/enums/tag-messages';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import * as request from 'supertest';
import { TAGS_ROUTE } from 'src/lib/constants';
import { TagRoutes } from 'src/tags/enums/tag-routes';
import { Role } from 'src/accounts/entities/account.entity';

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

  async function deleteTag(
    token: string,
    id: string,
  ): Promise<{
    body: { id: string; message: TagMessages };
  }> {
    const result: {
      body: { id: string; message: TagMessages };
    } = await request(server)
      .delete(TAGS_ROUTE + TagRoutes.DELETE + id)
      .set('Authorization', token);

    return result;
  }

  describe('scenario : if user is just a user', () => {
    it('should return forbidden resource', async () => {
      const createdTag = await helpersService.createRandomTag(app);

      const account = await helpersService.loginRandomAccount(app);

      const result = await deleteTag(account.token, createdTag.body.data.id);

      expect(result.body.message).toBe('Forbidden resource');
    });
  });

  describe('scenario : if user is a moderator', () => {
    it('tag should be deleted', async () => {
      const createdTag = await helpersService.createRandomTag(app);

      const moderator = await helpersService.loginRandomAccount(
        app,
        Role.MODERATOR,
      );

      const result = await deleteTag(moderator.token, createdTag.body.data.id);

      expect(result.body.message).toBe(TagMessages.DELETED);
    });
  });
});
