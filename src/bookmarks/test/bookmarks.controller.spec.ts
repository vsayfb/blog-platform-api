import { Test, TestingModule } from '@nestjs/testing';
import { jwtPayloadStub } from 'src/auth/stub/jwt-payload.stub';
import { CaslAbilityFactory } from 'src/global/casl/casl-ability.factory';
import { MANAGE_DATA_SERVICE } from 'src/lib/constants';
import { postStub } from 'src/posts/stub/post-stub';
import { BookmarksController } from '../bookmarks.controller';
import { BookmarksService } from '../bookmarks.service';
import { AccountBookmarks } from '../dto/account-bookmarks.dto';
import { PostBookmarks } from '../dto/post-bookmarks.dto';
import { Bookmark } from '../entities/bookmark.entity';
import { bookmarkStub } from '../stub/bookmark-stub';
import { SelectedBookmarkFields } from '../types/selected-bookmark-fields';

jest.mock('src/bookmarks/bookmarks.service');

describe('BookmarksController', () => {
  let bookmarksController: BookmarksController;
  let bookmarksService: BookmarksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookmarksController],
      providers: [
        BookmarksService,
        { provide: MANAGE_DATA_SERVICE, useClass: BookmarksService },
        CaslAbilityFactory,
      ],
    }).compile();

    bookmarksController = module.get<BookmarksController>(BookmarksController);
    bookmarksService = module.get<BookmarksService>(BookmarksService);
  });

  describe('create', () => {
    describe('when create is called', () => {
      let result: { data: SelectedBookmarkFields; message: string };
      const POST_ID = postStub().id;
      const account = jwtPayloadStub();

      beforeEach(async () => {
        result = await bookmarksController.create(POST_ID, account);
      });

      test('calls bookmarksService.create', () => {
        expect(bookmarksService.create).toHaveBeenCalledWith({
          postID: POST_ID,
          accountID: account.sub,
        });
      });

      it('should return the created bookmark', () => {
        expect(result.data).toEqual(bookmarkStub());
      });
    });
  });

  describe('findBookmark', () => {
    describe('when findBookmark is called', () => {
      let result: { data: Bookmark; message: string };
      const bookmark = bookmarkStub() as Bookmark;

      beforeEach(async () => {
        result = await bookmarksController.findBookmark(bookmark);
      });

      it('should return a bookmark', () => {
        expect(result.data).toEqual(bookmark);
      });
    });
  });

  describe('findPostBookmarks', () => {
    describe('when findPostBookmarks is called', () => {
      let result: { data: PostBookmarks; message: string };
      const postID = postStub().id;

      beforeEach(async () => {
        result = await bookmarksController.findPostBookmarks(postID);
      });

      test('calls bookmarksService.getPostBookmarks', () => {
        expect(bookmarksService.getPostBookmarks).toHaveBeenCalledWith(postID);
      });

      it('should return a bookmark', () => {
        expect(result.data).toEqual([bookmarkStub()]);
      });
    });
  });

  describe('findMyBookmarks', () => {
    describe('when findMyBookmarks is called', () => {
      let result: { data: AccountBookmarks; message: string };
      const me = jwtPayloadStub();

      beforeEach(async () => {
        result = await bookmarksController.findMyBookmarks(me);
      });

      test('calls bookmarksService.getAccountBookmarks', () => {
        expect(bookmarksService.getAccountBookmarks).toHaveBeenCalledWith(
          me.sub,
        );
      });

      it('should return an array of bookmarks', () => {
        expect(result.data).toEqual([bookmarkStub()]);
      });
    });
  });

  describe('remove', () => {
    describe('when remove is called', () => {
      let result: { id: string; message: string };
      const bookmark = bookmarkStub() as Bookmark;

      beforeEach(async () => {
        result = await bookmarksController.remove(bookmark);
      });

      test('calls bookmarksService.delete', () => {
        expect(bookmarksService.delete).toHaveBeenCalledWith(bookmark);
      });

      it("should return the deleted bookmark's id", () => {
        expect(result.id).toEqual(bookmark.id);
      });
    });
  });
});
