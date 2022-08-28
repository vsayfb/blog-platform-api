import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICrudService } from 'src/lib/interfaces/ICrudService';
import { PostMessages } from 'src/posts/enums/post-messages';
import { PostsService } from 'src/posts/posts.service';
import { Repository } from 'typeorm';
import { AccountCommentsDto } from './dto/account-comments.dto';
import { CommentViewDto } from './dto/comment-view.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatedCommentDto } from './dto/created-comment.dto';
import { RepliesViewDto } from './dto/replies-view.dto';
import { ReplyViewDto } from './dto/reply-view.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { CommentMessages } from './enums/comment-messages';
import { SelectedCommentFields } from './types/selected-comment-fields';

@Injectable()
export class CommentsService implements ICrudService<Comment> {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly postsService: PostsService,
  ) {}

  async create(dto: {
    authorID: string;
    postID: string;
    createCommentDto: CreateCommentDto;
  }): Promise<CreatedCommentDto> {
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
  }): Promise<ReplyViewDto> {
    const to = await this.getOneByID(data.toID);

    if (!to) throw new NotFoundException(CommentMessages.NOT_FOUND);

    const created = await this.commentRepository.save({
      parent: to,
      post: to.post,
      author: { id: data.authorID },
      content: data.dto.content,
    });

    return this.commentRepository.findOne({
      where: { id: created.id },
      relations: { parent: true, author: true },
    });
  }

  async getPostComments(postID: string): Promise<CommentViewDto[]> {
    const result = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.post', 'post')
      .leftJoin('comment.parent', 'parent')
      .leftJoinAndSelect('comment.author', 'author')
      .where('post.id=:postID', { postID })
      .andWhere('parent IS NULL')
      .getMany();

    return result;
  }

  async getCommentReplies(commentID: string): Promise<RepliesViewDto> {
    const result = await this.commentRepository.findOne({
      where: { id: commentID },
      relations: { replies: { author: true } },
    });

    return result.replies as any;
  }

  async getAccountComments(accountID: string): Promise<AccountCommentsDto> {
    return (await this.commentRepository.find({
      where: { author: { id: accountID } },
      relations: { post: true },
    })) as any;
  }

  async getOneByID(id: string): Promise<Comment> {
    return await this.commentRepository.findOne({
      where: { id },
      relations: { author: true, post: true },
    });
  }

  async delete(subject: Comment): Promise<string> {
    const commentID = subject.id;

    await this.commentRepository.remove(subject);

    return commentID;
  }

  async update(
    comment: Comment,
    dto: UpdateCommentDto,
  ): Promise<SelectedCommentFields> {
    comment.content = dto.content;

    return await this.commentRepository.save(comment);
  }

  async getAll(): Promise<Comment[]> {
    return await this.commentRepository.find({
      relations: { author: true, post: true },
    });
  }

  getOne(where: string): Promise<Comment> {
    throw new Error('Method not implemented.');
  }
}
