import { Injectable, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICrudService } from 'src/lib/interfaces/ICrudService';
import { Repository } from 'typeorm';
import { Bookmark } from './entities/bookmark.entity';

@Injectable()
export class BookmarksService implements ICrudService<Bookmark> {
  constructor(
    @InjectRepository(Bookmark)
    private readonly bookmarksRepository: Repository<Bookmark>,
  ) {}

  async create(data: { postID: string; accountID: string }): Promise<Bookmark> {
    const bookmark = await this.bookmarksRepository.save({
      account: { id: data.accountID },
      post: { id: data.postID },
    });

    return this.bookmarksRepository.findOne({ where: { id: bookmark.id } });
  }

  async delete(subject: Bookmark): Promise<string> {
    const id = subject.id;

    await this.bookmarksRepository.remove(subject);

    return id;
  }

  getPostBookmarks(postId: string): Promise<Bookmark[]> {
    return this.bookmarksRepository.find({
      where: { post: { id: postId } },
      relations: { account: true },
      loadEagerRelations: false,
    });
  }

  getUserBookmarks(accountID: string): Promise<Bookmark[]> {
    return this.bookmarksRepository.find({
      where: { account: { id: accountID } },
      relations: { post: true },
      loadEagerRelations: false,
    });
  }

  getOneByID(id: string): Promise<Bookmark> {
    return this.bookmarksRepository.findOne({
      where: { id },
    });
  }

  getAll(): Promise<Bookmark[]> {
    return this.bookmarksRepository.find();
  }

  update(subject: Bookmark, updateDto: any): Promise<Bookmark> {
    throw new Error('Method not implemented.');
  }

  getOne(where: string): Promise<Bookmark> {
    throw new Error('Method not implemented.');
  }
}
