import { Tag } from '../entities/tag.entity';
import { tagStub } from '../stub/tag.stub';

export const TagsService = jest.fn().mockReturnValue({
  createMultipleTagsIfNotExist: jest.fn().mockResolvedValue([tagStub()]),

  getOne: jest.fn().mockResolvedValue(tagStub()),

  create: jest.fn().mockResolvedValue(tagStub()),

  delete: jest.fn().mockResolvedValue(tagStub().id),

  update: jest.fn((tag: Tag, newName: string) =>
    Promise.resolve({
      ...tag,
      name: newName,
    }),
  ),

  getAll: jest.fn().mockResolvedValue([tagStub()]),
});
