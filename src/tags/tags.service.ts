import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
    return await this.tagsRepository.findOne({ where: { name } });
  }

  async getAll(): Promise<TagsDto> {
    return (await this.tagsRepository.find({
      relations: { posts: true },
    })) as any;
  }

  async delete(tag: Tag): Promise<string> {
    const id = tag.id;

    await this.tagsRepository.remove(tag);

    return id;
  }

  async create(name: string): Promise<SelectedTagFields> {
    await this.tagsRepository.save({ name });

    return this.getOne(name);
  }

  async getOneByID(id: string): Promise<any> {
    return await this.tagsRepository.findOne({ where: { id } });
  }

  async update(tag: Tag, newName: string): Promise<SelectedTagFields> {
    tag.name = newName;

    await this.tagsRepository.save(tag);

    return this.getOne(newName);
  }

  private async createIfNotExist({
    name,
  }: CreateTagDto): Promise<SelectedTagFields> {
    const tag = await this.getOne(name);

    if (!tag) return await this.tagsRepository.save({ name });

    return tag;
  }

  async createMultipleTagsIfNotExist(
    tagNames: string[],
  ): Promise<SelectedTagFields[]> {
    const tags: SelectedTagFields[] = [];

    for await (const name of tagNames) {
      const result = await this.createIfNotExist({ name });

      tags.push(result);
    }

    return tags;
  }
}
