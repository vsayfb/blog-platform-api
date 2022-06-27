export const TagsService = jest.fn().mockReturnValue({
  createMultipleTagsIfNotExist: jest.fn().mockResolvedValue([]),
});
