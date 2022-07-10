import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICrudService } from 'src/lib/interfaces/ICrudService';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';
import { CommentMessages } from './enums/comment-messages';

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
  }): Promise<{ data: Comment; message: string }> {
    return {
      data: await this.commentRepository.save({
        ...dto.createCommentDto,
        author: { id: dto.authorID },
        post: { id: dto.postID },
      }),
      message: CommentMessages.CREATED,
    };
  }

  async getAll(): Promise<{ data: Comment[]; message: string }> {
    return {
      data: await this.commentRepository.find(),
      message: CommentMessages.ALL_FOUND,
    };
  }
  async getOneByID(id: string): Promise<{ data: Comment; message: string }> {
    return {
      data: await this.commentRepository.findOne({ where: { id } }),
      message: CommentMessages.FOUND,
    };
  }

  async delete(subject: Comment): Promise<{ id: string; message: string }> {
    const commentID = subject.id;

    await this.commentRepository.remove(subject);

    return {
      id: commentID,
      message: CommentMessages.DELETED,
    };
  }

  getOne(
    where: string,
  ): Promise<NotFoundException | { data: Comment; message: string }> {
    throw new Error('Method not implemented.');
  }
  update(
    subject: Comment,
    data: any,
  ): Promise<{ data: Comment; message: string }> {
    throw new Error('Method not implemented.');
  }
}
