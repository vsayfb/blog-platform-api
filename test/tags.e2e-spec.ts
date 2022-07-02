import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from 'src/app.module';
import { DatabaseService } from 'src/database/database.service';
import { Tag } from 'src/tags/entities/tag.entity';
import { TagsController } from 'src/tags/tags.controller';
import * as request from 'supertest';
import { generateFakePost } from './helpers/faker/generateFakePost';
import { generateFakeTag } from './helpers/faker/generateFakeTag';
import { generateFakeUser } from './helpers/faker/generateFakeUser';
import { loginAccount } from './helpers/loginAccount';

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

  async function takeToken(): Promise<string> {
    const { username, password } = await databaseService.createRandomTestUser();

    const { access_token } = await loginAccount(app, username, password);

    return access_token;
  }

  async function createTag(token: string) {
    return await request(app.getHttpServer())
      .post('/tags/')
      .set('Authorization', `Bearer ${token}`)
      .send(generateFakeTag());
  }

  describe('create', () => {
    it('should be return the tag', async () => {
      const result: {
        body: { data: Tag; message: string };
        statusCode: number;
      } = await createTag(await takeToken());

      expect(result.statusCode).toBe(201);

      expect(result.body.data.id).toBeDefined();
    });
  });
});
