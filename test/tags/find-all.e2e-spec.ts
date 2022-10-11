jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { TagMessages } from 'src/tags/enums/tag-messages';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import * as request from 'supertest';
import { SelectedTagFields } from 'src/tags/types/selected-tag-fields';
import { TAGS_ROUTE } from 'src/lib/constants';

describe('(GET) find all', () => {
  let app: INestApplication;
  let databaseService: TestDatabaseService;
  let server: any;

  beforeAll(async () => {
    const { nestApp, database } = await initializeEndToEndTestModule();

    app = nestApp;
    databaseService = database;
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await databaseService.clearAllTables();
    await databaseService.disconnectDatabase();
    await app.close();
  });

  test('should return an array of tags', async () => {
    const tags: {
      body: { data: SelectedTagFields[]; message: TagMessages };
    } = await request(server).get(TAGS_ROUTE);

    expect(tags.body.message).toBe(TagMessages.ALL_FOUND);
  });
});
