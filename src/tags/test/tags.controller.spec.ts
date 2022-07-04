import { Tag } from './../entities/tag.entity';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { Test, TestingModule } from '@nestjs/testing';
import { TagsController } from '../tags.controller';
import { TagsService } from '../tags.service';

jest.mock('src/tags/tags.service.ts');

describe('TagsController', () => {
  let controller: TagsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagsController],
      providers: [
        TagsService,
        { provide: 'SUBJECT', useClass: Tag },
        { provide: 'SERVICE', useClass: TagsService },
        CaslAbilityFactory,
      ],
    }).compile();

    controller = module.get<TagsController>(TagsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
