import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateService } from 'src/lib/interfaces/create-service.interface';
import { IDeleteService } from 'src/lib/interfaces/delete-service.interface';
import { IFindService } from 'src/lib/interfaces/find-service.interface';
import { IUpdateService } from 'src/lib/interfaces/update-service.interface';
import { Repository } from 'typeorm';
import { TagsDto } from './response-dto/tags.dto';
import { Tag } from './entities/tag.entity';
import { TagMessages } from './enums/tag-messages';
import { SelectedTagFields } from './types/selected-tag-fields';
import { TagWithPosts } from './types/tag-with-posts';

@Injectable()
export class TagsService
  implements ICreateService, IFindService, IDeleteService, IUpdateService
{
  constructor(
    @InjectRepository(Tag) private readonly tagsRepository: Repository<Tag>,
  ) {}

  async create(dto: {
    tagName: string;
    authorID: string;
  }): Promise<SelectedTagFields> {
    const created = await this.tagsRepository.save({
      name: dto.tagName.toLowerCase(),
      author: { id: dto.authorID },
    });

    return this.tagsRepository.findOneBy({ id: created.id });
  }

  async getOneByID(id: string): Promise<SelectedTagFields> {
    return await this.tagsRepository.findOne({ where: { id } });
  }

  async update(tag: Tag, newName: string): Promise<SelectedTagFields> {
    tag.name = newName;

    const created = await this.tagsRepository.save(tag);

    return this.tagsRepository.findOneBy({ id: created.id });
  }

  async delete(tag: Tag): Promise<string> {
    const id = tag.id;

    await this.tagsRepository.remove(tag);

    return id;
  }

  async getOne(name: string): Promise<TagWithPosts> {
    let tag = await this.tagsRepository.findOne({
      where: { name, posts: { published: true } },
      relations: { author: true, posts: { author: true } },
    });

    /** maybe there is a tag but it does not contain any public posts,
     * if that is the case the above method returns null*/
    if (!tag) {
      tag = await this.tagsRepository.findOne({
        where: { name },
        relations: { author: true },
      });

      // there is no tag with this name
      if (!tag) throw new BadRequestException(TagMessages.NOT_FOUND);

      tag.posts = [];
    }

    return tag as unknown as TagWithPosts;
  }

  async getAll(): Promise<TagsDto> {
    const data = await this.tagsRepository.find({
      relations: { author: true },
    });

    return data as unknown as TagsDto;
  }

  async getPostTags(postID: string): Promise<SelectedTagFields[]> {
    return this.tagsRepository.findBy({ posts: { id: postID } });
  }

  async checkExistWithName(name: string): Promise<SelectedTagFields | null> {
    return await this.tagsRepository.findOne({
      where: { name },
      relations: { author: false, posts: false },
    });
  }
}
