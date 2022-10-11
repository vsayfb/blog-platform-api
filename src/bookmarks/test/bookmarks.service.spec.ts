import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { jwtPayloadStub } from 'src/auth/stub/jwt-payload.stub';
import { postStub } from 'src/posts/stub/post-stub';
import { mockRepository } from '../../../test/helpers/utils/mockRepository';
import { Repository } from 'typeorm';
import { BookmarksService } from '../bookmarks.service';
import { Bookmark } from '../entities/bookmark.entity';
import { bookmarkStub } from '../stub/bookmark-stub';
import { accountStub } from 'src/accounts/test/stub/account.stub';
import { SelectedBookmarkFields } from '../types/selected-bookmark-fields';
import { PostBookmarks } from '../dto/post-bookmarks.dto';
import { AccountBookmarks } from '../dto/account-bookmarks.dto';

describe('BookmarksService', () => {
  let bookmarksService: BookmarksService;
  let bookmarksRepository: Repository<Bookmark>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookmarksService,
        {
          provide: getRepositoryToken(Bookmark),
          useClass: Repository,
        },
      ],
    }).compile();

    bookmarksService = module.get<BookmarksService>(BookmarksService);
    bookmarksRepository = module.get<Repository<Bookmark>>(
      getRepositoryToken(Bookmark),
    );

    mockRepository(bookmarksRepository, Bookmark);
  });

  describe('create', () => {
    describe('when create is called', () => {
      let result: SelectedBookmarkFields;
      const POST_ID = postStub().id;
      const account = jwtPayloadStub();

      beforeEach(async () => {
        result = await bookmarksService.create({
          postID: POST_ID,
          accountID: account.sub,
        });
      });

      test('calls bookmarksRepository.save', () => {
        expect(bookmarksRepository.save).toHaveBeenCalledWith({
          account: { id: account.sub },
          post: { id: POST_ID },
        });
      });

      test('calls bookmarksRepository.findOne', () => {
        expect(bookmarksRepository.findOne).toHaveBeenCalledWith({
          where: { id: bookmarkStub().id },
        });
      });

      it('should return the created bookmark', () => {
        expect(result).toEqual(bookmarkStub());
      });
    });
  });

  describe('delete', () => {
    describe('when delete is called', () => {
      let result: string;
      const bookmark = bookmarkStub() as Bookmark;

      beforeEach(async () => {
        result = await bookmarksService.delete(bookmark);
      });

      test('calls bookmarksRepository.remove', () => {
        expect(bookmarksRepository.remove).toHaveBeenCalledWith(bookmark);
      });

      it("should return the deleted bookmark's id", () => {
        expect(result).toEqual(bookmark.id);
      });
    });
  });

  describe('getPostBookmarks', () => {
    describe('when getPostBookmarks is called', () => {
      let result: PostBookmarks;
      const POST_ID = postStub().id;

      beforeEach(async () => {
        result = await bookmarksService.getPostBookmarks(POST_ID);
      });

      test('calls bookmarksRepository.find', () => {
        expect(bookmarksRepository.find).toHaveBeenCalledWith({
          where: { post: { id: POST_ID } },
          relations: { account: true },
        });
      });

      it("should return the array of post's bookmarks", () => {
        expect(result).toEqual([bookmarkStub()]);
      });
    });
  });

  describe('getAccountBookmarks', () => {
    describe('when getAccountBookmarks is called', () => {
      let result: AccountBookmarks;
      const user = accountStub();

      beforeEach(async () => {
        result = await bookmarksService.getAccountBookmarks(user.id);
      });

      test('calls bookmarksRepository.find', () => {
        expect(bookmarksRepository.find).toHaveBeenCalledWith({
          where: { account: { id: user.id } },
          relations: { post: true },
        });
      });

      it("should return the array of user's bookmarks", () => {
        expect(result).toEqual([bookmarkStub()]);
      });
    });
  });

  describe('getOneByID', () => {
    describe('when getOneByID is called', () => {
      let result: Bookmark;
      const BOOKMARK_ID = bookmarkStub().id;

      beforeEach(async () => {
        result = await bookmarksService.getOneByID(BOOKMARK_ID);
      });

      test('calls bookmarksRepository.findOne', () => {
        expect(bookmarksRepository.findOne).toHaveBeenCalledWith({
          where: { id: BOOKMARK_ID },
          relations: { account: true, post: true },
        });
      });

      it('should return a bookmark', () => {
        expect(result).toEqual(bookmarkStub());
      });
    });
  });
});
