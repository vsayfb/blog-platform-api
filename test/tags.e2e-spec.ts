import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from 'src/app.module';
import { DatabaseService } from 'src/database/database.service';
import { Tag } from 'src/tags/entities/tag.entity';
import { TagsController } from 'src/tags/tags.controller';
import * as request from 'supertest';

describe('Tags Module (e2e)', () => {
  let app: INestApplication;
  let tagsController: TagsController;
  let databaseService: DatabaseService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    tagsController = moduleRef.get<TagsController>(TagsController);
    databaseService = moduleRef.get<DatabaseService>(DatabaseService);
  });

  afterAll(async () => {
    await databaseService.clearTableRows('tag');
    await databaseService.clearTableRows('post');
    await databaseService.closeDatabase();
    await app.close();
  });

  it('should be defined', async () => {
    const file = path.join(
      path.resolve() + '/src' + '/helpers' + '/barisabi.jpg',
    );

    const result = await request(app.getHttpServer())
      .post('/accounts/upload_profile_photo')
      .attach('image', file);

    console.log(result.body);
  });
});
