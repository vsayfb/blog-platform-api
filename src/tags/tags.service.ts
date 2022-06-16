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

  private async createIfNotExist(createTagDto: CreateTagDto): Promise<Tag> {
    const tag = await this.getByName(createTagDto.name);

    if (!tag)
      return await this.tagsRepository.save({ name: createTagDto.name });

    return tag;
  }

  async createMultipleTagsIfNotExist(tagNames: string[]) {
    let tags = [];

    for await (let name of tagNames) {
      const result = await this.createIfNotExist({ name });

      tags.push(result);
    }

    return tags;
  }

  getByName(name: string): Promise<Tag> {
    return this.tagsRepository.findOne({ where: { name } });
  }

  findAll(): Promise<Tag[]> {
    return this.tagsRepository.find();
  }
}
