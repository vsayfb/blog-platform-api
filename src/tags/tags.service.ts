import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICrudService } from 'src/lib/interfaces/ICrudService';
import { Repository } from 'typeorm';
import { CreateTagDto } from './dto/create-tag.dto';
import { Tag } from './entities/tag.entity';
import { TagMessages } from './enums/tag-messages';

@Injectable()
export class TagsService implements ICrudService<Tag> {
  constructor(
    @InjectRepository(Tag) private readonly tagsRepository: Repository<Tag>,
  ) {}
  async getOne(name: string): Promise<{ data: Tag; message: string }> {
    return {
      data: await this.tagsRepository.findOne({ where: { name } }),
      message: TagMessages.FOUND,
    };
  }

  async getAll(): Promise<{ data: Tag[]; message: string }> {
    return {
      data: await this.tagsRepository.find(),
      message: TagMessages.ALL_FOUND,
    };
  }

  async delete(tag: Tag): Promise<{ id: string; message: string }> {
    const id = tag.id;

    await this.tagsRepository.remove(tag);

    return { id, message: TagMessages.DELETED };
  }

  async create(name: string): Promise<{ data: Tag; message: string }> {
    return {
      data: await this.tagsRepository.save({ name }),
      message: TagMessages.CREATED,
    };
  }

  async getOneByID(id: string): Promise<{ data: Tag; message: string }> {
    return {
      data: await this.tagsRepository.findOne({ where: { id } }),
      message: TagMessages.FOUND,
    };
  }

  async update(
    tag: Tag,
    newName: string,
  ): Promise<{ data: Tag; message: string }> {
    tag.name = newName;

    return {
      data: await this.tagsRepository.save(tag),
      message: TagMessages.UPDATED,
    };
  }

  private async createIfNotExist({ name }: CreateTagDto): Promise<Tag> {
    const tag = await this.tagsRepository.findOne({ where: { name } });

    if (!tag) return await this.tagsRepository.save({ name });

    return tag;
  }

  async createMultipleTagsIfNotExist(tagNames: string[]): Promise<Tag[]> {
    const tags: Tag[] = [];

    for await (const name of tagNames) {
      const result = await this.createIfNotExist({ name });

      tags.push(result);
    }

    return tags;
  }
}
