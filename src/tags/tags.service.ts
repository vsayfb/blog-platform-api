import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateService } from 'src/lib/interfaces/create-service.interface';
import { IDeleteService } from 'src/lib/interfaces/delete-service.interface';
import { IFindService } from 'src/lib/interfaces/find-service.interface';
import { IUpdateService } from 'src/lib/interfaces/update-service.interface';
import { Repository } from 'typeorm';
import { CreateTagDto } from './dto/create-tag.dto';
import { TagsDto } from './dto/tags.dto';
import { Tag } from './entities/tag.entity';
import { SelectedTagFields } from './types/selected-tag-fields';

@Injectable()
export class TagsService
  implements ICreateService, IFindService, IDeleteService, IUpdateService
{
  constructor(
    @InjectRepository(Tag) private readonly tagsRepository: Repository<Tag>,
  ) {}

  async getOne(name: string): Promise<SelectedTagFields> {
    return await this.tagsRepository.findOne({
      where: { name },
      relations: { posts: { author: true }, author: true },
    });
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
    const tag = await this.getOne(name);

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
