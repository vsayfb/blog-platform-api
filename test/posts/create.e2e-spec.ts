jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { CreatedPostDto } from 'src/posts/dto/created-post.dto';
import { PostMessages } from 'src/posts/enums/post-messages';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';

describe('/ (POST) create post', () => {
  let app: INestApplication;
  let databaseService: TestDatabaseService;
  let helpersService: HelpersService;

  beforeAll(async () => {
    const { nestApp, database, helpers } = await initializeEndToEndTestModule();

    app = nestApp;
    helpersService = helpers;
    databaseService = database;
  });

  afterAll(async () => {
    await databaseService.clearAllTables();
    await databaseService.disconnectDatabase();
    await app.close();
  });

  it('should return the created post', async () => {
    const result: { body: { data: CreatedPostDto; message: string } } =
      await helpersService.createRandomPost(app);

    expect(result.body.message).toBe(PostMessages.CREATED);
  });
});
