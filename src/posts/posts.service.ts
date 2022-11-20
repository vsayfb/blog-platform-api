import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
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
import { UrlManagementService } from 'src/global/url-management/services/url-management.service';
import { ICreateService } from 'src/lib/interfaces/create-service.interface';
import { IFindService } from 'src/lib/interfaces/find-service.interface';
import { IUpdateService } from 'src/lib/interfaces/update-service.interface';
import { IDeleteService } from 'src/lib/interfaces/delete-service.interface';

@Injectable()
export class PostsService
  implements ICreateService, IFindService, IUpdateService, IDeleteService
{
  constructor(
    @InjectRepository(Post) private readonly postsRepository: Repository<Post>,
    private readonly uploadsService: UploadsService,
    private readonly tagsService: TagsService,
    private readonly urlManagementService: UrlManagementService,
  ) {}

  async create({
    authorID,
    dto,
    titleImage,
    published = true,
  }: {
    authorID: string;
    dto: CreatePostDto;
    titleImage: Express.Multer.File;
    published?: boolean;
  }): Promise<CreatedPostDto> {
    const url = this.urlManagementService.convertToUniqueUrl(dto.title);

    const tags = await this.setPostTags(dto.tags, authorID);

    let title_image: string | null = null;

    if (titleImage) {
      title_image = await this.uploadsService.uploadImage(titleImage);
    }

    const created = await this.postsRepository.save({
      content: dto.content,
      title: dto.title,
      url,
      tags,
      author: { id: authorID },
      title_image,
      published,
    });

    const result = await this.postsRepository.findOne({
      where: { id: created.id },
      relations: { tags: true, author: true },
    });

    return result as any;
  }

  async getAll(): Promise<PublicPostsDto> {
    const posts = await this.postsRepository
      .createQueryBuilder('post')
      .where('post.published= :published', { published: true })
      .leftJoinAndSelect('post.tags', 'tags')
      .leftJoinAndSelect('post.author', 'author')
      .loadRelationCountAndMap('post.comment_count', 'post.comments')
      .loadRelationCountAndMap('post.bookmark_count', 'post.bookmarks')
      .getMany();

    return posts as any;
  }

  async getOne(url: string): Promise<PublicPostDto> {
    const post = await this.postsRepository
      .createQueryBuilder('post')
      .where('post.url=:url', { url })
      .andWhere('post.published=:published', { published: true })
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.tags', 'tags')
      .leftJoinAndSelect('post.comments', 'post.comments')
      .loadRelationCountAndMap('post.bookmarks_count', 'post.bookmarks')
      .getOne();

    if (!post) throw new NotFoundException(PostMessages.NOT_FOUND);

    return post as unknown as PublicPostDto;
  }

  async update(
    post: PostDto,
    updatePostDto: UpdatePostDto,
  ): Promise<UpdatedPostDto> {
    post.title = updatePostDto.title;
    post.url = this.urlManagementService.convertToUniqueUrl(post.title);
    post.content = updatePostDto.content;

    if (updatePostDto.published === true) post.published = true;

    if (Array.isArray(updatePostDto.tags)) {
      post.tags = (await this.setPostTags(
        updatePostDto.tags,
        post.author.id,
      )) as Tag[];
    }

    const updated = await this.postsRepository.save(post);

    const result = await this.postsRepository.findOne({
      where: { id: updated.id },
      relations: { tags: true },
    });

    return result as any;
  }

  async updateTitleImage(
    post: PostDto,
    image: Express.Multer.File | null,
  ): Promise<string> {
    let title_image: string | null = null;

    if (image) title_image = await this.uploadsService.uploadImage(image);

    post.title_image = title_image;

    await this.postsRepository.save(post);

    return title_image;
  }

  private async setPostTags(
    tags: string[],
    authorID: string,
  ): Promise<SelectedTagFields[]> {
    return await this.tagsService.createMultipleTagsIfNotExist(tags, authorID);
  }

  async getOneByID(id: string): Promise<PostDto> {
    return (await this.postsRepository.findOne({
      where: { id },
      relations: { author: true, tags: true },
    })) as any;
  }

  async changePostStatus(
    post: PostDto,
  ): Promise<{ id: string; published: boolean }> {
    post.published = !post.published;

    const { id, published } = await this.postsRepository.save(post);

    return { id, published };
  }

  async getAccountPosts(id: string): Promise<PostsDto> {
    const posts = await this.postsRepository
      .createQueryBuilder('post')
      .where('post.author=:id', { id })
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.tags', 'tags')
      .loadRelationCountAndMap('post.comments_count', 'post.comments')
      .loadRelationCountAndMap('post.bookmarks_count', 'post.bookmarks')
      .getMany();

    return posts as any;
  }

  async getAccountPublicPosts(id: string): Promise<PostsDto> {
    const posts = await this.postsRepository
      .createQueryBuilder('post')
      .where('post.author=:id', { id })
      .andWhere('post.published=:published', { published: true })
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.tags', 'tags')
      .loadRelationCountAndMap('post.comments_count', 'post.comments')
      .loadRelationCountAndMap('post.bookmarks_count', 'post.bookmarks')
      .getMany();

    return posts as any;
  }

  async delete(post: PostDto): Promise<string> {
    const id = post.id;

    await this.postsRepository.remove(post as Post);

    return id;
  }
}
