jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { TagMessages } from 'src/tags/enums/tag-messages';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import { UpdateTagDto } from 'src/tags/response-dto/update-tag.dto';
import { SelectedTagFields } from 'src/tags/types/selected-tag-fields';
import { TAGS_ROUTE } from 'src/lib/constants';
import { TagRoutes } from 'src/tags/enums/tag-routes';
import { generateFakeTag } from 'test/helpers/utils/generateFakeTag';
import { Role } from 'src/accounts/entities/account.entity';
import * as request from 'supertest';

describe('(PATCH) update', () => {
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

  async function updateTag(
    token: string,
    id: string,
    dto: UpdateTagDto,
  ): Promise<{
    body: { data: SelectedTagFields; message: TagMessages };
    statusCode: number;
  }> {
    const result: {
      body: { data: SelectedTagFields; message: TagMessages };
      statusCode: number;
    } = await request(server)
      .patch(TAGS_ROUTE + TagRoutes.UPDATE + id)
      .set('Authorization', token)
      .send(dto);

    return result;
  }

  describe('scenario : if user is just a user', () => {
    it('should can not update the tag', async () => {
      const account = await helpersService.loginRandomAccount(app);

      const createdTag = await helpersService.createRandomTag(app);

      const result = await updateTag(
        account.token,
        createdTag.body.data.id,
        generateFakeTag(),
      );

      expect(result.statusCode).toBe(403);
    });
  });

  describe('scenario : if user is a moderator', () => {
    it('should can update the tag', async () => {
      const createdTag = await helpersService.createRandomTag(app);

      const moderator = await helpersService.loginRandomAccount(
        app,
        Role.MODERATOR,
      );

      const result = await updateTag(
        moderator.token,
        createdTag.body.data.id,
        generateFakeTag(),
      );

      expect(result.body.message).toBe(TagMessages.UPDATED);
    });
  });
});
