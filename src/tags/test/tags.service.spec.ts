import { randomUUID } from 'crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockRepository } from 'src/lib/mockRepository';
import { Tag } from '../entities/tag.entity';
import { TagsService } from '../tags.service';
import { tagStub } from '../stub/tag.stub';
import { Repository } from 'typeorm';

describe('TagsService', () => {
  let tagsService: TagsService;
  let tagsRepository: Repository<Tag>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        { provide: getRepositoryToken(Tag), useClass: Repository },
      ],
    }).compile();

    tagsService = module.get<TagsService>(TagsService);
    tagsRepository = module.get<Repository<Tag>>(getRepositoryToken(Tag));

    mockRepository(tagsRepository, Tag);
  });

  describe('getOne', () => {
    describe('when getOne is called', () => {
      let result: { data: Tag; message: string };
      const tag = tagStub();

      beforeEach(async () => {
        result = await tagsService.getOne(tag.name);
      });

      test('calls tagsRepository.findOne method', () => {
        expect(tagsRepository.findOne).toHaveBeenCalledWith({
          where: { name: tag.name },
        });
      });

      it('should return a tag', () => {
        expect(result.data).toEqual(tag);
      });
    });
  });

  describe('getOne', () => {
    describe('when getAll is called', () => {
      let result: { data: Tag[]; message: string };

      beforeEach(async () => {
        result = await tagsService.getAll();
      });

      test('calls tagsRepository.find method', () => {
        expect(tagsRepository.find).toHaveBeenCalled();
      });

      it('should return a tag', () => {
        expect(result.data).toEqual([tagStub()]);
      });
    });
  });

  describe('delete', () => {
    describe('when delete is called', () => {
      let result: { id: string; message: string };

      const tag = tagStub() as unknown as Tag;

      beforeEach(async () => {
        result = await tagsService.delete(tag);
      });

      test('calls tagsRepository.remove method', () => {
        expect(tagsRepository.remove).toHaveBeenCalledWith(tag);
      });

      it("should return the tag's id", () => {
        expect(result.id).toEqual(tag.id);
      });
    });
  });

  describe('create', () => {
    describe('when create is called', () => {
      let result: { data: Tag; message?: string };

      const tagName = 'nodejs';

      beforeEach(async () => {
        result = await tagsService.create(tagName);
      });

      test('calls tagsRepository.save method', () => {
        expect(tagsRepository.save).toHaveBeenCalledWith({ name: tagName });
      });

      it("should return the tag's id", () => {
        expect(result.data.name).toEqual(tagName);
      });
    });
  });

  describe('getOneByID', () => {
    describe('when getOneByID is called', () => {
      let result: { data: Tag; message?: string };

      const tagID = tagStub().id;

      beforeEach(async () => {
        result = await tagsService.getOneByID(tagID);
      });

      test('calls tagsRepository.findOne method', () => {
        expect(tagsRepository.findOne).toHaveBeenCalledWith({
          where: { id: tagID },
        });
      });

      it('should return a tag', () => {
        expect(result.data).toEqual(tagStub());
      });
    });
  });

  describe('update', () => {
    describe('when update is called', () => {
      let result: { data: Tag; message?: string };

      const newTagName = 'nodejs';
      const tag = tagStub() as unknown as Tag;

      beforeEach(async () => {
        result = await tagsService.update(tag, newTagName);
      });

      test('calls tagsRepository.save method', () => {
        expect(tagsRepository.save).toHaveBeenCalledWith(tag);
      });

      it('should return the updated tag', () => {
        expect(result.data.name).toEqual(newTagName);
      });
    });
  });
});
