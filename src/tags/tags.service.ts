import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TAG_NOT_FOUND } from 'src/lib/api-messages';
import { ICrudService } from 'src/lib/interfaces/ICrudService';
import { Repository } from 'typeorm';
import { CreateTagDto } from './dto/create-tag.dto';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagsService implements ICrudService<Tag> {
  constructor(
    @InjectRepository(Tag) private readonly tagsRepository: Repository<Tag>,
  ) {}
  async getOne(
    name: string,
  ): Promise<NotFoundException | { data: Tag; message: string }> {
    return {
      data: await this.tagsRepository.findOne({ where: { name } }),
      message: 'A tag found.',
    };
  }

  async getAll(): Promise<{ data: Tag[]; message: string }> {
    return {
      data: await this.tagsRepository.find(),
      message: 'All tags find.',
    };
  }

  async delete(id: string): Promise<{ id: string; message: string }> {
    const tag = await this.tagsRepository.findOne({ where: { id } });

    if (!tag) throw new ForbiddenException(TAG_NOT_FOUND);

    return { id, message: 'The tag removed.' };
  }

  async create(name: string): Promise<{ data: Tag; message: string }> {
    return {
      data: await this.tagsRepository.save({ name }),
      message: 'A tag created.',
    };
  }

  async getOneByID(id: string): Promise<Tag> {
    return this.tagsRepository.findOne({ where: { id } });
  }

  async update(
    id: string,
    newName: string,
  ): Promise<{ data: Tag; message: string }> {
    const tag = await this.tagsRepository.findOne({ where: { id } });

    tag.name = newName;

    return {
      data: await this.tagsRepository.save(tag),
      message: 'The tag updated.',
    };
  }

  private async createIfNotExist({ name }: CreateTagDto): Promise<Tag> {
    const tag = await this.tagsRepository.findOne({ where: { name } });

    if (!tag) return await this.tagsRepository.save({ name });

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

  findAll(): Promise<Tag[]> {
    return this.tagsRepository.find();
  }
}
