import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { TagsController } from 'src/tags/tags.controller';

describe('Tags Module (e2e)', () => {
  let tagsController: TagsController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    tagsController = moduleRef.get<TagsController>(TagsController);
  });

  it('should be defined', () => {
    expect(tagsController).toBeDefined();
  });
});
