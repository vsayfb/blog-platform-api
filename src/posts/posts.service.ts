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
import { POST_DELETED, POST_NOT_FOUND } from 'src/lib/api-messages';
import { JwtPayload } from 'src/lib/jwt.payload';

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
  }): Promise<{
    data: Post;
    message: string;
  }> {
    const url = this.convertUrl(dto.title);

    let titleImage: null | string = null;

    const tags = await this.setPostTags(dto.tags);

    if (dto.titleImage) titleImage = dto.titleImage;

    const { content, title } = dto;

    return {
      data: await this.postsRepository.save({
        content,
        title,
        url,
        tags,
        author: { id: authorID },
        titleImage,
        published,
      }),
      message: 'Created a post!',
    };
  }

  async getAll(): Promise<{ data: Post[]; message: string }> {
    return {
      data: await this.postsRepository.find({ where: { published: true } }),
      message: 'All posts find.',
    };
  }

  async getOne(
    url: string,
  ): Promise<{ data: Post; message: string } | NotFoundException> {
    const post = await this.postsRepository.findOne({
      where: { url, published: true },
    });

    if (!post) throw new NotFoundException(POST_NOT_FOUND);

    return { data: post, message: 'A post find.' };
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
  ): Promise<{ data: Post; message: string }> {
    const post = await this.getOneByID(id);

    if (!post) throw new NotFoundException(POST_NOT_FOUND);

    post.title = updatePostDto.title;
    post.url = this.convertUrl(post.title);
    post.content = updatePostDto.content;

    if (updatePostDto.published === true) post.published = true;

    if (Array.isArray(updatePostDto.tags)) {
      post.tags = await this.setPostTags(updatePostDto.tags);
    }

    if (updatePostDto.titleImage) post.titleImage = updatePostDto.titleImage;

    return {
      data: await this.postsRepository.save(post),
      message: 'Updated a post.',
    };
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

  async changePostStatus(postID: string, me: JwtPayload) {
    const post = await this.postsRepository.findOne({
      where: { id: postID, author: { id: me.sub } },
    });

    if (!post) throw new NotFoundException(POST_NOT_FOUND);

    post.published = !post.published;

    const { id, published } = await this.postsRepository.save(post);

    return { id, published };
  }

  getMyPosts(id: string): Promise<Post[]> {
    return this.postsRepository.find({ where: { author: { id } } });
  }

  async delete(id: string) {
    const post = await this.getOneByID(id);

    if (!post) throw new NotFoundException(POST_NOT_FOUND);

    await this.postsRepository.remove(post);

    return { id, message: POST_DELETED };
  }
}
