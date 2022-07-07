import { UpdateTagDto } from '../dto/update-tag.dto';
import { Tag } from '../entities/tag.entity';
import { TagMessages } from '../enums/tag-messages';
import { tagStub } from '../stub/tag.stub';

export const TagsService = jest.fn().mockReturnValue({
  createMultipleTagsIfNotExist: jest.fn().mockResolvedValue([tagStub()]),
  getOne: jest.fn().mockResolvedValue({ data: tagStub(), message: '' }),
  create: jest.fn().mockResolvedValue({ data: tagStub(), message: '' }),
  delete: jest.fn((tag: Tag) => Promise.resolve({ id: tag.id, message: '' })),
  update: jest.fn((tag: Tag, newName: string) =>
    Promise.resolve({
      data: { ...tag, name: newName },
      message: TagMessages.UPDATED,
    }),
  ),
  getAll: jest.fn().mockResolvedValue({ data: [tagStub()], message: '' }),
});
