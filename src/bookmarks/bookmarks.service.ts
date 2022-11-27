import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateService } from 'src/lib/interfaces/create-service.interface';
import { IDeleteService } from 'src/lib/interfaces/delete-service.interface';
import { IFindService } from 'src/lib/interfaces/find-service.interface';
import { Repository } from 'typeorm';
import { AccountBookmarks } from './dto/account-bookmarks.dto';
import { PostBookmarks } from './dto/post-bookmarks.dto';
import { Bookmark } from './entities/bookmark.entity';
import { BookmarkMessages } from './enums/bookmark-messages';
import { SelectedBookmarkFields } from './types/selected-bookmark-fields';

@Injectable()
export class BookmarksService
  implements ICreateService, IFindService, IDeleteService
{
  constructor(
    @InjectRepository(Bookmark)
    private readonly bookmarksRepository: Repository<Bookmark>,
  ) {}

  async create(data: {
    postID: string;
    accountID: string;
  }): Promise<SelectedBookmarkFields> {
    const { postID, accountID } = data;

    const bookmarked = await this.checkAccountHaveBookmarkOnPost(
      accountID,
      postID,
    );

    if (bookmarked)
      throw new ForbiddenException(BookmarkMessages.ALREADY_BOOKMARKED);

    const bookmark = await this.bookmarksRepository.save({
      account: { id: data.accountID },
      post: { id: data.postID },
    });

    return this.bookmarksRepository.findOne({
      where: { id: bookmark.id },
    }) as any;
  }

  async delete(subject: Bookmark): Promise<string> {
    const id = subject.id;

    await this.bookmarksRepository.remove(subject);

    return id;
  }

  async checkAccountHaveBookmarkOnPost(
    accountID: string,
    postID: string,
  ): Promise<boolean> {
    const bookmark = await this.bookmarksRepository.findOne({
      where: { post: { id: postID }, account: { id: accountID } },
    });

    return bookmark ? true : false;
  }

  async getAccountBookmarks(accountID: string): Promise<AccountBookmarks> {
    return (await this.bookmarksRepository.find({
      where: { account: { id: accountID } },
      relations: { post: true },
    })) as any;
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

  async getByPostAndAccount(postID: string, accountID: string) {
    return this.bookmarksRepository.findOne({
      where: { post: { id: postID }, account: { id: accountID } },
    });
  }
}
