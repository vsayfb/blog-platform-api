import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostMessages } from 'src/resources/posts/enums/post-messages';
import { PostsService } from 'src/resources/posts/services/posts.service';
import { Repository } from 'typeorm';
import { CreateCommentDto } from '../request-dto/create-comment.dto';
import { UpdateCommentDto } from '../request-dto/update-comment.dto';
import { PostComment } from '../entities/post-comment.entity';
import { CommentMessages } from '../enums/comment-messages';
import { SelectedCommentFields } from '../types/selected-comment-fields';
import { ICreateService } from 'src/lib/interfaces/create-service.interface';
import { IFindService } from 'src/lib/interfaces/find-service.interface';
import { IUpdateService } from 'src/lib/interfaces/update-service.interface';
import { IDeleteService } from 'src/lib/interfaces/delete-service.interface';
import { CommentExpressionType } from '../entities/comment-expression.entity';
import { NewComment } from '../types/new-comment';
import { NewReply } from '../types/new-reply';
import { PostCommentType } from '../types/post-comment';
import { AccountComment } from '../types/account-comment';
import { CommentReply } from '../types/comment-reply';

@Injectable()
export class CommentsService
  implements ICreateService, IFindService, IDeleteService, IUpdateService
{
  constructor(
    @InjectRepository(PostComment)
    private readonly commentRepository: Repository<PostComment>,
    private readonly postsService: PostsService,
  ) {}

  async create(dto: {
    authorID: string;
    postID: string;
    createCommentDto: CreateCommentDto;
  }): Promise<NewComment> {
    const post = await this.postsService.getOneByID(dto.postID);

    if (!post) throw new NotFoundException(PostMessages.NOT_FOUND);

    const created = await this.commentRepository.save({
      ...dto.createCommentDto,
      author: { id: dto.authorID },
      post,
    });

    const result = await this.getOneByID(created.id);

    return { ...result, post };
  }

  async replyToComment(data: {
    toID: string;
    authorID: string;
    dto: CreateCommentDto;
  }): Promise<NewReply> {
    const parent = await this.getOneByID(data.toID);

    if (!parent) throw new NotFoundException(CommentMessages.NOT_FOUND);

    const created = await this.commentRepository.save({
      parent,
      post: parent.post,
      author: { id: data.authorID },
      content: data.dto.content,
    });

    const result = await this.commentRepository.findOne({
      where: { id: created.id },
      relations: { author: true },
    });

    result.parent = parent;
    result.post = parent.post;

    delete parent.post;

    return result as NewReply;
  }

  async getPostComments(postID: string): Promise<PostCommentType[]> {
    if (!(await this.postsService.checkPublicByID(postID)))
      throw new ForbiddenException();

    const result = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.post', 'post')
      .leftJoin('comment.parent', 'parent')
      .leftJoinAndSelect('comment.author', 'author')
      .where('post.id=:postID', { postID })
      .andWhere('parent IS NULL') // just find comments that reply to post
      .loadRelationCountAndMap(
        'comment.like_count',
        'comment.expressions',
        'comment_expression',
        (qb) =>
          qb.where(
            `comment_expression.expression = '${CommentExpressionType.LIKE}'`,
          ),
      )
      .loadRelationCountAndMap(
        'comment.dislike_count',
        'comment.expressions',
        'comment_expression',
        (qb) =>
          qb.where(
            `comment_expression.expression = '${CommentExpressionType.DISLIKE}'`,
          ),
      )
      .loadRelationCountAndMap('comment.reply_count', 'comment.replies')
      .getMany();

    return result as unknown as PostCommentType[];
  }

  async getCommentReplies(commentID: string): Promise<CommentReply[]> {
    const result = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.parent', 'parent')
      .where('parent.id=:commentID', { commentID })
      .leftJoinAndSelect('comment.author', 'author')
      .loadRelationCountAndMap(
        'comment.like_count',
        'comment.expressions',
        'comment',
        (qb) =>
          qb.where(`comment.expression = '${CommentExpressionType.LIKE}'`),
      )
      .loadRelationCountAndMap(
        'comment.dislike_count',
        'comment.expressions',
        'comment',
        (qb) =>
          qb.where(`comment.expression = '${CommentExpressionType.DISLIKE}'`),
      )
      .loadRelationCountAndMap('comment.reply_count', 'comment.replies')
      .getMany();

    return result as unknown as CommentReply[];
  }

  async getAccountComments(accountID: string): Promise<AccountComment[]> {
    const comments = await this.commentRepository.find({
      where: { author: { id: accountID } },
      relations: { post: true },
    });

    return comments;
  }

  async getOneByID(id: string): Promise<PostComment> {
    return await this.commentRepository.findOne({
      where: { id },
      relations: { author: true, post: true },
    });
  }

  async delete(subject: PostComment): Promise<string> {
    const commentID = subject.id;

    await this.commentRepository.remove(subject);

    return commentID;
  }

  async update(
    comment: PostComment,
    dto: UpdateCommentDto,
  ): Promise<SelectedCommentFields> {
    comment.content = dto.content;

    return await this.commentRepository.save(comment);
  }

  async getAll(): Promise<PostComment[]> {
    return await this.commentRepository.find({
      relations: { author: true },
    });
  }
}
