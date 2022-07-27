import { Tag } from './../entities/tag.entity';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { Test, TestingModule } from '@nestjs/testing';
import { TagsController } from '../tags.controller';
import { TagsService } from '../tags.service';
import { tagStub } from '../stub/tag.stub';
import { UpdateTagDto } from '../dto/update-tag.dto';
import { SelectedTagFields } from '../types/selected-tag-fields';
import { TagsDto } from '../dto/tags.dto';

jest.mock('src/tags/tags.service.ts');

describe('TagsController', () => {
  let tagsController: TagsController;
  let tagsService: TagsService;

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

    tagsController = module.get<TagsController>(TagsController);
    tagsService = module.get<TagsService>(TagsService);
  });

  describe('findOne', () => {
    describe('when findOne is called', () => {
      let result: { data: SelectedTagFields; message: string };
      const dto = tagStub();

      beforeEach(async () => {
        result = await tagsController.findOne(dto.name);
      });

      test('calls tagsService.getOne method', () => {
        expect(tagsService.getOne).toHaveBeenCalledWith(dto.name);
      });

      it('should return a tag', () => {
        expect(result.data).toEqual(dto);
      });
    });
  });

  describe('create', () => {
    describe('when create is called', () => {
      let result: { data: SelectedTagFields; message: string };
      const createTagDto = tagStub();

      beforeEach(async () => {
        result = await tagsController.create(createTagDto);
      });

      test('calls tagsService.create method', () => {
        expect(tagsService.create).toHaveBeenCalledWith(createTagDto.name);
      });

      it('should return a tag', () => {
        expect(result.data).toEqual(createTagDto);
      });
    });
  });

  describe('findAll', () => {
    describe('when findAll is called', () => {
      let result: { data: TagsDto; message: string };

      beforeEach(async () => {
        result = await tagsController.findAll();
      });

      test('calls tagsService.getAll method', () => {
        expect(tagsService.getAll).toHaveBeenCalled();
      });

      it('should return an array of tags', () => {
        expect(result.data).toEqual(expect.any(Array));
      });
    });
  });

  describe('update', () => {
    describe('when update is called', () => {
      let result: { data: SelectedTagFields; message?: string };
      const tag = tagStub() as unknown as Tag;
      const updateDto: UpdateTagDto = { name: 'new_tag' };

      beforeEach(async () => {
        result = await tagsController.update(updateDto, tag);
      });

      test('calls tagsService.update method', () => {
        expect(tagsService.update).toHaveBeenCalledWith(tag, updateDto.name);
      });

      it('should return the updated post', () => {
        expect(result.data.name).toEqual(updateDto.name);
      });
    });
  });

  describe('delete', () => {
    describe('when delete is called', () => {
      let result: { id: string; message: string };
      const tag = tagStub() as unknown as Tag;

      beforeEach(async () => {
        result = await tagsController.remove(tag);
      });

      test('calls tagsService.delete method', () => {
        expect(tagsService.delete).toHaveBeenCalledWith(tag);
      });

      it("should return the deleted tag's id", () => {
        expect(result.id).toEqual(tag.id);
      });
    });
  });
});
