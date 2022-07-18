import { Injectable, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICrudService } from 'src/lib/interfaces/ICrudService';
import { Repository } from 'typeorm';
import { AccountBookmarks } from './dto/account-bookmarks.dto';
import { PostBookmarks } from './dto/post-bookmarks.dto';
import { Bookmark } from './entities/bookmark.entity';
import { SelectedBookmarkFields } from './types/selected-bookmark-fields';

@Injectable()
export class BookmarksService implements ICrudService<Bookmark> {
  constructor(
    @InjectRepository(Bookmark)
    private readonly bookmarksRepository: Repository<Bookmark>,
  ) {}

  async create(data: {
    postID: string;
    accountID: string;
  }): Promise<SelectedBookmarkFields> {
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

  async getPostBookmarks(postId: string): Promise<PostBookmarks> {
    return (await this.bookmarksRepository.find({
      where: { post: { id: postId } },
      relations: { account: true },
    })) as any;
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

  update(subject: Bookmark, updateDto: any): Promise<Bookmark> {
    throw new Error('Method not implemented.');
  }

  getOne(where: string): Promise<Bookmark> {
    throw new Error('Method not implemented.');
  }
}
