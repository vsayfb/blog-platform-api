import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from '../request-dto/create-post.dto';
import { UpdatePostDto } from '../request-dto/update-post.dto';
import { Post } from '../entities/post.entity';
import { UploadsService } from 'src/uploads/uploads.service';
import { TagsService } from 'src/resources/tags/tags.service';
import { Tag } from 'src/resources/tags/entities/tag.entity';
import { PostMessages } from '../enums/post-messages';
import { PostDto } from '../response-dto/post.dto';
import { SelectedTagFields } from 'src/resources/tags/types/selected-tag-fields';
import { UrlManagementService } from 'src/global/url-management/services/url-management.service';
import { ICreateService } from 'src/lib/interfaces/create-service.interface';
import { IFindService } from 'src/lib/interfaces/find-service.interface';
import { IUpdateService } from 'src/lib/interfaces/update-service.interface';
import { IDeleteService } from 'src/lib/interfaces/delete-service.interface';
import { PostExpressionType } from '../entities/post-expression.entity';
import { NewPost } from '../types/new-post';
import { PublicPost } from '../types/public-post';
import { UpdatedPost } from '../types/updated-post';
import { PostType } from '../types/post';
import { AccountPost } from '../types/account-post';
import { PublicPosts } from '../types/public-posts';

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
    publish,
  }: {
    authorID: string;
    dto: CreatePostDto;
    titleImage: Express.Multer.File;
    publish: boolean;
  }): Promise<NewPost> {
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
      published: publish,
    });

    const result = await this.postsRepository.findOne({
      where: { id: created.id },
      relations: { tags: true, author: true },
    });

    return { ...result, published: created.published };
  }

  async getAll(): Promise<PublicPosts> {
    const posts = await this.postsRepository
      .createQueryBuilder('post')
      .where('post.published= :published', { published: true })
      .leftJoinAndSelect('post.tags', 'tags')
      .leftJoinAndSelect('post.author', 'author')
      .loadRelationCountAndMap('post.comment_count', 'post.comments')
      .loadRelationCountAndMap(
        'post.like_count',
        'post.expressions',
        'post_expression',
        (qb) =>
          qb.where(`post_expression.expression = '${PostExpressionType.LIKE}'`),
      )
      .getMany();

    return posts as unknown as PublicPosts;
  }

  async getOne(url: string): Promise<PublicPost> {
    const post = await this.postsRepository
      .createQueryBuilder('post')
      .where('post.url=:url', { url })
      .andWhere('post.published=:published', { published: true })
      .leftJoinAndSelect('post.author', 'author')
      .getOne();

    if (!post) throw new NotFoundException(PostMessages.NOT_FOUND);

    return post as unknown as PublicPost;
  }

  async update(
    post: PostDto,
    updatePostDto: UpdatePostDto,
  ): Promise<UpdatedPost> {
    post.title = updatePostDto.title;
    post.url = this.urlManagementService.convertToUniqueUrl(post.title);
    post.content = updatePostDto.content;

    if (Array.isArray(updatePostDto.tags)) {
      const newTags = await this.setPostTags(
        updatePostDto.tags,
        post.author.id,
      );

      post.tags = newTags as Tag[];
    }

    const updated = await this.postsRepository.save(post);

    const result = await this.postsRepository.findOne({
      where: { id: updated.id },
      relations: { tags: true },
    });

    return result;
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
    const postTags: SelectedTagFields[] = [];

    for await (const tagName of tags) {
      let tag = await this.tagsService.checkExistWithName(tagName);

      if (!tag) {
        tag = await this.tagsService.create({ tagName, authorID });
      }

      postTags.push(tag);
    }

    return postTags;
  }

  async getOneByID(id: string): Promise<PostType> {
    return await this.postsRepository.findOne({
      where: { id },
      relations: { author: true },
      select: {
        published: true,
        id: true,
        content: true,
        title_image: true,
        title: true,
        url: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async changePostStatus(
    post: PostDto,
  ): Promise<{ id: string; published: boolean }> {
    post.published = !post.published;

    const { id, published } = await this.postsRepository.save(post);

    return { id, published };
  }

  async getAccountPosts(id: string): Promise<AccountPost[]> {
    const posts = await this.postsRepository
      .createQueryBuilder('post')
      .where('post.author=:id', { id })
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.tags', 'tags')
      .loadRelationCountAndMap('post.comments_count', 'post.comments')
      .loadRelationCountAndMap('post.bookmarks_count', 'post.bookmarks')
      .addSelect('post.published')
      .getMany();

    return posts as unknown as AccountPost[];
  }

  async getAccountPublicPosts(id: string): Promise<AccountPost[]> {
    const posts = await this.postsRepository
      .createQueryBuilder('post')
      .where('post.author=:id', { id })
      .andWhere('post.published=:published', { published: true })
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.tags', 'tags')
      .loadRelationCountAndMap('post.comments_count', 'post.comments')
      .loadRelationCountAndMap('post.bookmarks_count', 'post.bookmarks')
      .getMany();

    return posts as unknown as AccountPost[];
  }

  async checkPublicByID(id: string) {
    return !!(await this.postsRepository.findOneBy({ id, published: true }));
  }

  async delete(post: PostDto): Promise<string> {
    const id = post.id;

    await this.postsRepository.remove(post as Post);

    return id;
  }
}
