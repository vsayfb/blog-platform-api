import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateService } from 'src/lib/interfaces/create-service.interface';
import { IDeleteService } from 'src/lib/interfaces/delete-service.interface';
import { IFindService } from 'src/lib/interfaces/find-service.interface';
import { Repository } from 'typeorm';
import { Bookmark } from './entities/bookmark.entity';
import { BookmarkMessages } from './enums/bookmark-messages';
import { SelectedBookmarkFields } from './types/selected-bookmark-fields';
import { AccountBookmark } from './types/account-bookmark';
import { CacheJsonService } from 'src/cache/services/cache-json.service';
import { CACHED_ROUTES } from 'src/cache/constants/cached-routes';

@Injectable()
export class BookmarksService
  implements ICreateService, IFindService, IDeleteService
{
  constructor(
    @InjectRepository(Bookmark)
    private readonly bookmarksRepository: Repository<Bookmark>,
    private readonly cacheJsonService: CacheJsonService,
  ) {}

  async create(data: {
    postID: string;
    accountID: string;
  }): Promise<SelectedBookmarkFields> {
    const { postID, accountID } = data;

    const bookmarked = await this.getByPostAndAccount(postID, accountID);

    if (bookmarked)
      throw new ForbiddenException(BookmarkMessages.ALREADY_BOOKMARKED);

    const savedBookmark = await this.bookmarksRepository.save({
      account: { id: data.accountID },
      post: { id: data.postID },
    });

    const newBookmark = await this.bookmarksRepository.findOne({
      where: { id: savedBookmark.id },
      relations: { post: true },
    });

    const cacheBookmark: AccountBookmark = {
      id: newBookmark.id,
      created_at: newBookmark.created_at,
      post: newBookmark.post,
    };

    this.cacheJsonService.insertToArray({
      key: CACHED_ROUTES.CLIENT_BOOKMARKS + accountID,
      data: cacheBookmark,
    });

    delete newBookmark.post;

    return newBookmark;
  }

  async delete(subject: Bookmark): Promise<string> {
    const bookmarkID = subject.id;

    const removed = await this.bookmarksRepository.remove(subject);

    const removeCache: AccountBookmark = { ...removed, id: bookmarkID };

    this.cacheJsonService.removeFromArray({
      key: CACHED_ROUTES.CLIENT_BOOKMARKS + subject.account.id,
      data: removeCache,
    });

    return bookmarkID;
  }

  async getAccountBookmarks(accountID: string): Promise<AccountBookmark[]> {
    const result = await this.bookmarksRepository
      .createQueryBuilder('bookmark')
      .leftJoinAndSelect('bookmark.post', 'post')
      .leftJoin('bookmark.account', 'account')
      .where('post.published=:published', { published: true })
      .andWhere('account.id=:accountID', { accountID })
      .getMany();

    return result as unknown as AccountBookmark[];
  }

  getOneByID(id: string): Promise<Bookmark> {
    return this.bookmarksRepository.findOne({
      where: { id },
      relations: { account: true, post: true },
    });
  }

  getAll(): Promise<Bookmark[]> {
    return this.bookmarksRepository.find({
      relations: { account: true, post: true },
    });
  }

  async getCountOnPost(postID: string): Promise<number> {
    return this.bookmarksRepository.countBy({ post: { id: postID } });
  }

  async getByPostAndAccount(
    postID: string,
    accountID: string,
  ): Promise<Bookmark> {
    return this.bookmarksRepository.findOne({
      where: { post: { id: postID }, account: { id: accountID } },
      relations: { post: true, account: true },
    });
  }
}
