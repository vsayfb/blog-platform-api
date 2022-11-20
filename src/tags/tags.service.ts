import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateService } from 'src/lib/interfaces/create-service.interface';
import { IDeleteService } from 'src/lib/interfaces/delete-service.interface';
import { IFindService } from 'src/lib/interfaces/find-service.interface';
import { IUpdateService } from 'src/lib/interfaces/update-service.interface';
import { Repository } from 'typeorm';
import { CreateTagDto } from './dto/create-tag.dto';
import { TagViewDto } from './dto/tag-view.dto';
import { TagsDto } from './dto/tags.dto';
import { Tag } from './entities/tag.entity';
import { TagMessages } from './enums/tag-messages';
import { SelectedTagFields } from './types/selected-tag-fields';

@Injectable()
export class TagsService
  implements ICreateService, IFindService, IDeleteService, IUpdateService
{
  constructor(
    @InjectRepository(Tag) private readonly tagsRepository: Repository<Tag>,
  ) {}

  async getOne(name: string): Promise<TagViewDto> {
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

      // there is really no tag
      if (!tag) throw new BadRequestException(TagMessages.NOT_FOUND);

      tag.posts = [];
    }

    return tag as unknown as TagViewDto;
  }

  async getAll(): Promise<TagsDto> {
    return (await this.tagsRepository.find({
      relations: { author: true },
    })) as any;
  }

  async delete(tag: Tag): Promise<string> {
    const id = tag.id;

    await this.tagsRepository.remove(tag);

    return id;
  }

  async create(dto: {
    tagName: string;
    authorID: string;
  }): Promise<SelectedTagFields> {
    await this.tagsRepository.save({
      name: dto.tagName,
      author: { id: dto.authorID },
    });

    return this.getOne(dto.tagName);
  }

  async getOneByID(id: string): Promise<any> {
    return await this.tagsRepository.findOne({ where: { id } });
  }

  async update(tag: Tag, newName: string): Promise<SelectedTagFields> {
    tag.name = newName;

    await this.tagsRepository.save(tag);

    return this.getOne(newName);
  }

  private async createIfNotExist(
    name: string,
    authorID: string,
  ): Promise<SelectedTagFields> {
    const tag = await this.tagsRepository.findOne({ where: { name } });

    if (!tag)
      return await this.tagsRepository.save({ name, author: { id: authorID } });

    return tag;
  }

  async createMultipleTagsIfNotExist(
    tagNames: string[],
    authorID: string,
  ): Promise<SelectedTagFields[]> {
    const tags: SelectedTagFields[] = [];

    for await (const name of tagNames) {
      const result = await this.createIfNotExist(name, authorID);

      tags.push(result);
    }

    return tags;
  }
}
