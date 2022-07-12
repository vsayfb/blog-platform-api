import { bookmarkStub } from '../stub/bookmark-stub';

export const BookmarksService = jest.fn().mockReturnValue({
  create: jest.fn().mockResolvedValue(bookmarkStub()),
  getPostBookmarks: jest.fn().mockResolvedValue([bookmarkStub()]),
  getOneByID: jest.fn().mockResolvedValue(bookmarkStub()),
  delete: jest.fn().mockResolvedValue(bookmarkStub().id),
});
