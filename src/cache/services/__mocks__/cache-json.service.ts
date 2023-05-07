export const CacheJsonService = jest.fn().mockReturnValue({
  get: jest.fn().mockResolvedValueOnce(undefined),
  save: jest.fn().mockResolvedValueOnce(undefined),
  update: jest.fn().mockResolvedValueOnce(undefined),
  updateFields: jest.fn().mockResolvedValueOnce(undefined),
  insertToArray: jest.fn().mockResolvedValueOnce(undefined),
  updateInArray: jest.fn().mockResolvedValueOnce(undefined),
  remove: jest.fn().mockResolvedValueOnce(undefined),
  removeFromArray: jest.fn().mockResolvedValueOnce(undefined),
});
