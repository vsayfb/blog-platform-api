import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTagDto } from './dto/create-tag.dto';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag) private readonly tagsRepository: Repository<Tag>,
  ) {}

  async create(name: string): Promise<Tag> {
    return this.tagsRepository.save({ name });
  }

  async getOne(id: string): Promise<Tag> {
    return this.tagsRepository.findOne({ where: { id } });
  }

  async update(id: string, newName: string): Promise<Tag> {
    const tag = await this.tagsRepository.findOne({ where: { id } });

    tag.name = newName;

    return this.tagsRepository.save(tag);
  }

  private async createIfNotExist(createTagDto: CreateTagDto): Promise<Tag> {
    const tag = await this.getByName(createTagDto.name);

    if (!tag)
      return await this.tagsRepository.save({ name: createTagDto.name });

    return tag;
  }

  async createMultipleTagsIfNotExist(tagNames: string[]): Promise<Tag[]> {
    let tags: Tag[] = [];

    for await (let name of tagNames) {
      const result = await this.createIfNotExist({ name });

      tags.push(result);
    }

    return tags;
  }

  async remove(id: string) {
    return this.tagsRepository.remove(id);
  }

  getByName(name: string): Promise<Tag> {
    return this.tagsRepository.findOne({ where: { name } });
  }

  findAll(): Promise<Tag[]> {
    return this.tagsRepository.find();
  }
}
