import { ICrudService } from './../lib/interfaces/ICrudService';
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
import { PostMessages } from './enums/post-messages';

@Injectable()
export class PostsService implements ICrudService<Post> {
  constructor(
    @InjectRepository(Post) private readonly postsRepository: Repository<Post>,
    private readonly uploadService: UploadsService,
    private readonly tagsService: TagsService,
  ) {}

  async create({
    authorID,
    dto,
    published = true,
  }: {
    authorID: string;
    dto: CreatePostDto;
    published?: boolean;
  }): Promise<Post> {
    const url = this.convertUrl(dto.title);

    const tags = await this.setPostTags(dto.tags);

    const { content, title } = dto;

    return await this.postsRepository.save({
      content,
      title,
      url,
      tags,
      author: { id: authorID },
      title_image: dto.title_image || null,
      published,
    });
  }

  async getAll(): Promise<Post[]> {
    return await this.postsRepository.find({ where: { published: true } });
  }

  async getOne(url: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { url, published: true },
    });

    if (!post) throw new NotFoundException(PostMessages.NOT_FOUND);

    return post;
  }

  async update(post: Post, updatePostDto: UpdatePostDto): Promise<Post> {
    post.title = updatePostDto.title;
    post.url = this.convertUrl(post.title);
    post.content = updatePostDto.content;

    if (updatePostDto.published === true) post.published = true;

    if (Array.isArray(updatePostDto.tags)) {
      post.tags = await this.setPostTags(updatePostDto.tags);
    }

    if (updatePostDto.title_image) post.title_image = updatePostDto.title_image;

    return await this.postsRepository.save(post);
  }

  async saveTitleImage(image: Express.Multer.File): Promise<string> {
    return await this.uploadService.uploadImage(image);
  }

  private async setPostTags(tags: string[]): Promise<Tag[]> {
    return await this.tagsService.createMultipleTagsIfNotExist(tags);
  }

  private convertUrl(title: string): string {
    const uniqueID = new ShortUniqueID();

    return `${slugify(title, { lower: true })}-${uniqueID()}`;
  }

  async getOneByID(id: string): Promise<Post> {
    return await this.postsRepository.findOne({ where: { id } });
  }

  async changePostStatus(
    post: Post,
  ): Promise<{ id: string; published: boolean }> {
    post.published = !post.published;

    const { id, published } = await this.postsRepository.save(post);

    return { id, published };
  }

  async getMyPosts(id: string): Promise<Post[]> {
    return await this.postsRepository.find({ where: { author: { id } } });
  }

  async delete(post: Post): Promise<string> {
    const id = post.id;

    await this.postsRepository.remove(post);

    return id;
  }
}
