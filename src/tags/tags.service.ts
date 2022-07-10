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

  async getOne(name: string): Promise<Tag> {
    return await this.tagsRepository.findOne({ where: { name } });
  }

  async getAll(): Promise<Tag[]> {
    return await this.tagsRepository.find();
  }

  async delete(tag: Tag): Promise<string> {
    const id = tag.id;

    await this.tagsRepository.remove(tag);

    return id;
  }

  async create(name: string): Promise<Tag> {
    return await this.tagsRepository.save({ name });
  }

  async getOneByID(id: string): Promise<any> {
    return await this.tagsRepository.findOne({ where: { id } });
  }

  async update(tag: Tag, newName: string): Promise<Tag> {
    tag.name = newName;

    return await this.tagsRepository.save(tag);
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
