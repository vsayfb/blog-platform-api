import { UpdateTagDto } from './../src/tags/dto/update-tag.dto';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Role } from 'src/accounts/entities/account.entity';
import { AppModule } from 'src/app.module';
import { DatabaseService } from 'src/database/database.service';
import { Tag } from 'src/tags/entities/tag.entity';
import * as request from 'supertest';
import { generateFakeTag } from './helpers/faker/generateFakeTag';
import { loginAccount } from './helpers/loginAccount';
import { TagRoutes } from 'src/tags/enums/tag-routes';
import { SelectedTagFields } from 'src/tags/types/selected-tag-fields';
import { TagMessages } from 'src/tags/enums/tag-messages';

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

  async function createTag(token: string): Promise<{
    body: { data: SelectedTagFields; message: TagMessages };
    statusCode: number;
  }> {
    const result: {
      body: { data: SelectedTagFields; message: TagMessages };
      statusCode: number;
    } = await request(app.getHttpServer())
      .post(PREFIX + TagRoutes.CREATE)
      .set('Authorization', `Bearer ${token}`)
      .send(generateFakeTag());

    return result;
  }

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
    } = await request(app.getHttpServer())
      .patch(PREFIX + TagRoutes.UPDATE + id)
      .set('Authorization', `Bearer ${token}`)
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
    } = await request(app.getHttpServer())
      .delete(PREFIX + TagRoutes.DELETE + id)
      .set('Authorization', `Bearer ${token}`);

    return result;
  }

  describe('findAll', () => {
    test('should return an array of tags', async () => {
      const tags: {
        body: { data: SelectedTagFields[]; message: TagMessages };
      } = await request(app.getHttpServer()).get(PREFIX);

      expect(tags.body.message).toBe(TagMessages.ALL_FOUND);
    });
  });

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

        expect(result.body.message).toBe(TagMessages.CREATED);
      });
    });
  });

  describe('update', () => {
    let createdTag: { body: { data: SelectedTagFields; message: string } };

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

        expect(result.body.message).toBe(TagMessages.UPDATED);
      });
    });
  });

  describe('delete', () => {
    let createdTag: { body: { data: SelectedTagFields; message: string } };

    beforeEach(async () => {
      createdTag =
        createdTag || (await createTag(await takeToken(Role.MODERATOR)));
    });

    describe('scenario : if user is just a user', () => {
      it('should can not delete the tag', async () => {
        const result = await deleteTag(
          await takeToken(),
          createdTag.body.data.id,
        );

        expect(result.statusCode).toBe(403);
      });
    });

    describe('scenario : if user is a moderator', () => {
      it('should can delete the tag', async () => {
        const result = await deleteTag(
          await takeToken(Role.MODERATOR),
          createdTag.body.data.id,
        );

        expect(result.body.message).toBe(TagMessages.DELETED);
      });
    });
  });
});
