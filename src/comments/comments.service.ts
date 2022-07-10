import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICrudService } from 'src/lib/interfaces/ICrudService';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
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
  }): Promise<Comment> {
    return await this.commentRepository.save({
      ...dto.createCommentDto,
      author: { id: dto.authorID },
      post: { id: dto.postID },
    });
  }

  async getAll(): Promise<Comment[]> {
    return await this.commentRepository.find();
  }

  async getPostComments(postID: string): Promise<Comment[]> {
    return await this.commentRepository.find({
      where: { post: { id: postID } },
    });
  }

  async getOneByID(id: string): Promise<Comment> {
    return await this.commentRepository.findOne({ where: { id } });
  }

  async delete(subject: Comment): Promise<string> {
    const commentID = subject.id;

    await this.commentRepository.remove(subject);

    return commentID;
  }

  async update(comment: Comment, dto: UpdateCommentDto): Promise<Comment> {
    comment.content = dto.content;

    return await this.commentRepository.save(comment);
  }

  getOne(where: string): Promise<Comment> {
    throw new Error('Method not implemented.');
  }
}
