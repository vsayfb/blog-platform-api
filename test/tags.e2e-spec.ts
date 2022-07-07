import { UpdateTagDto } from './../src/tags/dto/update-tag.dto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Role } from 'src/accounts/entities/account.entity';
import { AppModule } from 'src/app.module';
import { DatabaseService } from 'src/database/database.service';
import { Tag } from 'src/tags/entities/tag.entity';
import * as request from 'supertest';
import { generateFakeTag } from './helpers/faker/generateFakeTag';
import { loginAccount } from './helpers/loginAccount';
import { TagRoutes } from 'src/tags/enums/tag-routes';

const PREFIX = '/tags';

describe('Tags Module (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    databaseService = moduleRef.get<DatabaseService>(DatabaseService);
  });

  afterAll(async () => {
    await databaseService.clearTableRows('tag');
    await databaseService.clearTableRows('post');
    await databaseService.closeDatabase();
    await app.close();
  });

  async function takeToken(role: Role = Role.USER): Promise<string> {
    const { username, password } = await databaseService.createRandomTestUser(
      role,
    );

    const { access_token } = await loginAccount(app, username, password);

    return access_token;
  }

  async function createTag(token: string): Promise<request.Response> {
    const result = await request(app.getHttpServer())
      .post(PREFIX + TagRoutes.CREATE)
      .set('Authorization', `Bearer ${token}`)
      .send(generateFakeTag());

    return result;
  }

  async function updateTag(token: string, id: string, dto: UpdateTagDto) {
    const result = await request(app.getHttpServer())
      .patch(PREFIX + TagRoutes.UPDATE + id)
      .set('Authorization', `Bearer ${token}`)
      .send(dto);

    return result;
  }

  describe('create', () => {
    describe('scenario : if user is just a user', () => {
      it('should can not create a tag', async () => {
        const result = await createTag(await takeToken());

        expect(result.statusCode).toBe(403);
      });
    });

    describe('scenario : if user is a moderator', () => {
      it('should can create a tag', async () => {
        const result = await createTag(await takeToken(Role.MODERATOR));

        expect(result.statusCode).toBe(201);
      });
    });
  });

  describe('update', () => {
    let createdTag: { body: { data: Tag; message: string } };

    beforeEach(async () => {
      createdTag =
        createdTag || (await createTag(await takeToken(Role.MODERATOR)));
    });

    describe('scenario : if user is just a user', () => {
      it('should can not update the tag', async () => {
        const result = await updateTag(
          await takeToken(),
          createdTag.body.data.id,
          generateFakeTag(),
        );

        expect(result.statusCode).toBe(403);
      });
    });

    describe('scenario : if user is a moderator', () => {
      it('should can update the tag', async () => {
        const result = await updateTag(
          await takeToken(Role.MODERATOR),
          createdTag.body.data.id,
          generateFakeTag(),
        );

        expect(result.statusCode).toBe(200);
      });
    });
  });
});
