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
import { CreatedPostDto } from './dto/created-post.dto';
import { PublicPostsDto } from './dto/public-posts.dto';
import { PublicPostDto } from './dto/public-post.dto';
import { UpdatedPostDto } from './dto/updated-post.dto';
import { PostDto } from './dto/post.dto';
import { PostsDto } from './dto/posts.dto';
import { SelectedTagFields } from 'src/tags/types/selected-tag-fields';

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
  }): Promise<CreatedPostDto> {
    const url = this.convertUrl(dto.title);

    const tags = await this.setPostTags(dto.tags);

    const created = await this.postsRepository.save({
      content: dto.content,
      title: dto.title,
      url,
      tags,
      author: { id: authorID },
      title_image: dto.title_image || null,
      published,
    });

    const result = await this.postsRepository.findOne({
      where: { id: created.id },
      relations: { tags: true, author: true },
    });

    return result as any;
  }

  async getAll(): Promise<PublicPostsDto> {
    const posts = await this.postsRepository.find({
      where: { published: true },
      relations: { tags: true, author: true },
    });

    return posts as any;
  }

  async getOne(url: string): Promise<PublicPostDto> {
    const post = await this.postsRepository
      .createQueryBuilder('post')
      .where('post.url=:url', { url })
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.tags', 'tags')
      .leftJoin('post.comments', 'comments')
      .loadRelationCountAndMap('post.comments', 'post.comments')
      .leftJoin('post.bookmarks', 'bookmarks')
      .loadRelationCountAndMap('post.bookmarks', 'post.bookmarks')
      .getOne();

    if (!post) throw new NotFoundException(PostMessages.NOT_FOUND);

    return post as any;
  }

  async update(
    post: Post,
    updatePostDto: UpdatePostDto,
  ): Promise<UpdatedPostDto> {
    post.title = updatePostDto.title;
    post.url = this.convertUrl(post.title);
    post.content = updatePostDto.content;

    if (updatePostDto.published === true) post.published = true;

    if (Array.isArray(updatePostDto.tags)) {
      post.tags = (await this.setPostTags(updatePostDto.tags)) as Tag[];
    }

    if (updatePostDto.title_image) post.title_image = updatePostDto.title_image;

    const updated = await this.postsRepository.save(post);

    const result = await this.postsRepository.findOne({
      where: { id: updated.id },
      relations: { tags: true },
    });

    return result as any;
  }

  async saveTitleImage(image: Express.Multer.File): Promise<string> {
    return await this.uploadService.uploadImage(image);
  }

  private async setPostTags(tags: string[]): Promise<SelectedTagFields[]> {
    return await this.tagsService.createMultipleTagsIfNotExist(tags);
  }

  private convertUrl(title: string): string {
    const uniqueID = new ShortUniqueID();

    return `${slugify(title, { lower: true })}-${uniqueID()}`;
  }

  async getOneByID(id: string): Promise<PostDto> {
    return (await this.postsRepository.findOne({
      where: { id },
      relations: { author: true, tags: true },
    })) as any;
  }

  async changePostStatus(
    post: Post,
  ): Promise<{ id: string; published: boolean }> {
    post.published = !post.published;

    const { id, published } = await this.postsRepository.save(post);

    return { id, published };
  }

  async getMyPosts(id: string): Promise<PostsDto> {
    const posts = await this.postsRepository
      .createQueryBuilder('post')
      .where('post.author=:id', { id })
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.tags', 'tags')
      .leftJoin('post.comments', 'comments')
      .loadRelationCountAndMap('post.comments', 'post.comments')
      .leftJoin('post.bookmarks', 'bookmarks')
      .loadRelationCountAndMap('post.bookmarks', 'post.bookmarks')
      .getMany();

    return posts as any;
  }

  async delete(post: Post): Promise<string> {
    const id = post.id;

    await this.postsRepository.remove(post);

    return id;
  }
}
