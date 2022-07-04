import { randomUUID } from 'crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockRepository } from 'src/lib/mockRepository';
import { Tag } from '../entities/tag.entity';
import { TagsService } from '../tags.service';
import { tagStub } from '../stub/tag.stub';
import { Repository } from 'typeorm';

describe('TagsService', () => {
  let service: TagsService;
  let tagsRepository: Repository<Tag>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        { provide: getRepositoryToken(Tag), useClass: Repository },
      ],
    }).compile();

    service = module.get<TagsService>(TagsService);
    tagsRepository = module.get<Repository<Tag>>(getRepositoryToken(Tag));

    mockRepository(tagsRepository, Tag);
  });

  it('should be defined', async () => {});
});
