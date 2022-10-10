import { bookmarkStub } from '../stub/bookmark-stub';

export const BookmarksService = jest.fn().mockReturnValue({
  create: jest.fn().mockResolvedValue(bookmarkStub()),
  delete: jest.fn().mockResolvedValue(bookmarkStub().id),
  getPostBookmarks: jest.fn().mockResolvedValue([bookmarkStub()]),
  getAccountBookmarks: jest.fn().mockResolvedValue([bookmarkStub()]),
  getOneByID: jest.fn().mockResolvedValue(bookmarkStub()),
  getAll: jest.fn().mockResolvedValue([bookmarkStub()]),
});
