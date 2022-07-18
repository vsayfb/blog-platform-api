import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tag } from '../entities/tag.entity';
import { TagsService } from '../tags.service';
import { tagStub } from '../stub/tag.stub';
import { Repository } from 'typeorm';
import { mockRepository } from '../../../test/helpers/mockRepository';
import { SelectedTagFields } from '../types/selected-tag-fields';
import { TagsDto } from '../dto/tags.dto';

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
      let result: SelectedTagFields;
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
        expect(result).toEqual(tag);
      });
    });
  });

  describe('getOne', () => {
    describe('when getAll is called', () => {
      let result: TagsDto[];

      beforeEach(async () => {
        result = await tagsService.getAll();
      });

      test('calls tagsRepository.find method', () => {
        expect(tagsRepository.find).toHaveBeenCalled();
      });

      it('should return a tag', () => {
        expect(result).toEqual([tagStub()]);
      });
    });
  });

  describe('delete', () => {
    describe('when delete is called', () => {
      let result: string;

      const tag = tagStub() as unknown as Tag;

      beforeEach(async () => {
        result = await tagsService.delete(tag);
      });

      test('calls tagsRepository.remove method', () => {
        expect(tagsRepository.remove).toHaveBeenCalledWith(tag);
      });

      it("should return the tag's id", () => {
        expect(result).toEqual(tag.id);
      });
    });
  });

  describe('create', () => {
    describe('when create is called', () => {
      let result: { name: any; id: string };

      const tagName = 'node-js';

      beforeEach(async () => {
        result = await tagsService.create(tagName);
      });

      test('calls tagsRepository.save method', () => {
        expect(tagsRepository.save).toHaveBeenCalledWith({ name: tagName });
      });

      it('should return the created tag', () => {
        expect(result).toEqual(tagStub());
      });
    });
  });

  describe('getOneByID', () => {
    describe('when getOneByID is called', () => {
      let result: Tag;

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
        expect(result).toEqual(tagStub());
      });
    });
  });

  describe('update', () => {
    describe('when update is called', () => {
      let result: { name: any; id: string };

      const newTagName = 'nodejs';
      const tag = tagStub() as Tag;

      beforeEach(async () => {
        result = await tagsService.update(tag, newTagName);
      });

      test('calls tagsRepository.save method', () => {
        expect(tagsRepository.save).toHaveBeenCalledWith(tag);
      });

      it('should return the updated tag', () => {
        expect(result).toEqual(tagStub());
      });
    });
  });
});
