import { Get, Injectable, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICrudService } from 'src/lib/interfaces/ICrudService';
import { Repository } from 'typeorm';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
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

  getPostBookmarks(@Param('postId') postId: string) {
    return this.bookmarksRepository.find({ where: { post: { id: postId } } });
  }

  getOneByID(id: string): Promise<Bookmark> {
    return this.bookmarksRepository.findOne({ where: { id } });
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
