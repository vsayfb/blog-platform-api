import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import uniqueID from 'short-unique-id';
import slugify from 'slugify';
import { UploadsService } from 'src/uploads/uploads.service';
import { TagsService } from 'src/tags/tags.service';
import { Tag } from 'src/tags/entities/tag.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postsRepository: Repository<Post>,
    private readonly uploadService: UploadsService,
    private readonly tagsService: TagsService,
  ) {}

  async create(
    authorID: string,
    dto: CreatePostDto,
    image: Express.Multer.File | undefined,
  ): Promise<Post> {
    const url = `${slugify(dto.title)}-${new uniqueID()()}`;

    let titleImage: string | null = null;

    if (image) {
      const newImageUrl = await this.uploadService.uploadImage(image);
      titleImage = newImageUrl;
    }

    let tags: Tag[] = [];

    if (dto.tags && dto.tags.length) {
      tags = await this.tagsService.createMultipleTagsIfNotExist(dto.tags);
    }

    const { content, title } = dto;

    return this.postsRepository.save({
      content,
      title,
      url,
      tags,
      author: { id: authorID },
      titleImage,
    });
  }

  findAll(): Promise<Post[]> {
    return this.postsRepository.find({});
  }

  findOne(url: string) {
    return this.postsRepository.findOne({ where: { url } });
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
