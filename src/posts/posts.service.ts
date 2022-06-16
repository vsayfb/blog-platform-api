import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import ShortUniqueID from 'short-unique-id';
import slugify from 'slugify';
import { UploadsService } from 'src/uploads/uploads.service';
import { TagsService } from 'src/tags/tags.service';
import { Tag } from 'src/tags/entities/tag.entity';
import { POST_NOT_FOUND } from 'src/common/error-messages';

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
    isPublic: boolean,
  ): Promise<Post> {
    const url = this.convertUrl(dto.title);

    let titleImage: null | string = null;

    let tags: Tag[] = [];

    if (isPublic) {
      tags = await this.setPostTags(dto.tags);
    }

    if (image) titleImage = await this.saveTitleImage(image);

    const { content, title } = dto;

    return this.postsRepository.save({
      content,
      title,
      url,
      tags,
      author: { id: authorID },
      titleImage,
      isPublic,
    });
  }

  findAll(): Promise<Post[]> {
    return this.postsRepository.find({ where: { isPublic: true } });
  }

  async getPost(url: string) {
    const post = await this.postsRepository.findOne({
      where: { url, isPublic: true },
    });

    if (!post) throw new NotFoundException(POST_NOT_FOUND);

    return post;
  }

  async getOne(url: string) {
    return this.postsRepository.findOne({
      where: { url },
    });
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    image: Express.Multer.File | undefined,
  ) {
    const post = await this.postsRepository.findOne({ where: { id } });

    if (!post) throw new NotFoundException(POST_NOT_FOUND);

    post.title = updatePostDto.title;
    post.url = this.convertUrl(post.title);
    post.content = updatePostDto.content;

    if (post.isPublic === true)
      post.tags = await this.setPostTags(updatePostDto.tags);

    if (image) post.titleImage = await this.saveTitleImage(image);

    return this.postsRepository.save(post);
  }

  private async saveTitleImage(image: Express.Multer.File | undefined) {
    let titleImage: string | null = null;

    if (image) {
      const newImageUrl = await this.uploadService.uploadImage(image);
      titleImage = newImageUrl;
    }

    return titleImage;
  }

  private async setPostTags(tags: string[] | undefined) {
    let newTags: Tag[] = [];

    if (tags && tags.length) {
      newTags = await this.tagsService.createMultipleTagsIfNotExist(tags);
    }

    return newTags;
  }

  private convertUrl(title: string) {
    const uniqueID = new ShortUniqueID();

    return `${slugify(title, { lower: true })}-${uniqueID()}`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
