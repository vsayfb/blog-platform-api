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
    published: boolean | undefined = true,
  ): Promise<Post> {
    const url = this.convertUrl(dto.title);

    let titleImage: null | string = null;

    let tags: Tag[] = [];

    if (published && dto.tags?.length) tags = await this.setPostTags(dto.tags);

    if (image) titleImage = await this.saveTitleImage(image);

    const { content, title } = dto;

    return this.postsRepository.save({
      content,
      title,
      url,
      tags,
      author: { id: authorID },
      titleImage,
      published,
    });
  }

  findAll(): Promise<Post[]> {
    return this.postsRepository.find();
  }

  async getPost(url: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { url, published: true },
    });

    if (!post) throw new NotFoundException(POST_NOT_FOUND);

    return post;
  }

  async getOne(url: string): Promise<Post> {
    return this.postsRepository.findOne({
      where: { url },
    });
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    image: Express.Multer.File | undefined,
  ): Promise<Post> {
    const post = await this.postsRepository.findOne({ where: { id } });

    if (!post) throw new NotFoundException(POST_NOT_FOUND);

    post.title = updatePostDto.title;
    post.url = this.convertUrl(post.title);
    post.content = updatePostDto.content;

    if (post.published) post.tags = await this.setPostTags(updatePostDto.tags);

    if (image) post.titleImage = await this.saveTitleImage(image);

    return this.postsRepository.save(post);
  }

  private async saveTitleImage(image: Express.Multer.File): Promise<string> {
    return await this.uploadService.uploadImage(image);
  }

  private async setPostTags(tags: string[]): Promise<Tag[]> {
    return await this.tagsService.createMultipleTagsIfNotExist(tags);
  }

  private convertUrl(title: string): string {
    const uniqueID = new ShortUniqueID();

    return `${slugify(title, { lower: true })}-${uniqueID()}`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
