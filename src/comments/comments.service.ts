import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICrudService } from 'src/lib/interfaces/ICrudService';
import { Repository } from 'typeorm';
import { AccountCommentsDto } from './dto/account-comments.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PostCommentsDto } from './dto/post-comments.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { SelectedCommentFields } from './types/selected-comment-fields';

@Injectable()
export class CommentsService implements ICrudService<Comment> {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async create(dto: {
    authorID: string;
    postID: string;
    createCommentDto: CreateCommentDto;
  }): Promise<SelectedCommentFields> {
    const created = await this.commentRepository.save({
      ...dto.createCommentDto,
      author: { id: dto.authorID },
      post: { id: dto.postID },
    });

    return await this.commentRepository.findOne({ where: { id: created.id } });
  }

  async getAll(): Promise<Comment[]> {
    return await this.commentRepository.find({
      relations: { author: true, post: true },
    });
  }

  async getPostComments(postID: string): Promise<PostCommentsDto> {
    return (await this.commentRepository.find({
      where: { post: { id: postID } },
      relations: { author: true },
    })) as any;
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

  getOne(where: string): Promise<Comment> {
    throw new Error('Method not implemented.');
  }
}
