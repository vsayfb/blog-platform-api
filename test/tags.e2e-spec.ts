jest.setTimeout(30000);

import { UpdateTagDto } from './../src/tags/dto/update-tag.dto';
import { INestApplication } from '@nestjs/common';
import { Role } from 'src/accounts/entities/account.entity';
import * as request from 'supertest';
import { TagRoutes } from 'src/tags/enums/tag-routes';
import { SelectedTagFields } from 'src/tags/types/selected-tag-fields';
import { TagMessages } from 'src/tags/enums/tag-messages';
import { TestDatabaseService } from './database/database.service';
import { HelpersService } from './helpers/helpers.service';
import { initializeEndToEndTestModule } from './utils/initializeEndToEndTestModule';
import { generateFakeTag } from './utils/generateFakeTag';

const PREFIX = '/tags';

describe('Tags Module (e2e)', () => {
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
      .patch(PREFIX + TagRoutes.UPDATE + id)
      .set('Authorization', token)
      .send(dto);

    return result;
  }

  async function deleteTag(
    token: string,
    id: string,
  ): Promise<{
    body: { id: string; message: TagMessages };
    statusCode: number;
  }> {
    const result: {
      body: { id: string; message: TagMessages };
      statusCode: number;
    } = await request(server)
      .delete(PREFIX + TagRoutes.DELETE + id)
      .set('Authorization', token);

    return result;
  }

  describe('findAll', () => {
    test('should return an array of tags', async () => {
      const tags: {
        body: { data: SelectedTagFields[]; message: TagMessages };
      } = await request(server).get(PREFIX);

      expect(tags.body.message).toBe(TagMessages.ALL_FOUND);
    });
  });

  describe('create', () => {
    describe('scenario : if user is just a user', () => {
      it('should can not create a tag', async () => {
        const account = await helpersService.loginRandomAccount(app);

        const result = await helpersService.createRandomTag(
          app,
          account.user.role,
        );

        expect(result.statusCode).toBe(403);
      });
    });

    describe('scenario : if user is a moderator', () => {
      it('should can create a tag', async () => {
        const result = await helpersService.createRandomTag(app);

        expect(result.body.message).toBe(TagMessages.CREATED);
      });
    });
  });

  describe('update', () => {
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

  describe('delete', () => {
    describe('scenario : if user is just a user', () => {
      it('should can not delete the tag', async () => {
        const createdTag = await helpersService.createRandomTag(app);

        const account = await helpersService.loginRandomAccount(app);

        const result = await deleteTag(account.token, createdTag.body.data.id);

        expect(result.statusCode).toBe(403);
      });
    });

    describe('scenario : if user is a moderator', () => {
      it('should can delete the tag', async () => {
        const createdTag = await helpersService.createRandomTag(app);

        const moderator = await helpersService.loginRandomAccount(
          app,
          Role.MODERATOR,
        );

        const result = await deleteTag(
          moderator.token,
          createdTag.body.data.id,
        );

        expect(result.body.message).toBe(TagMessages.DELETED);
      });
    });
  });
});
