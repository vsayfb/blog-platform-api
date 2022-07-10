import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { Comment } from '../entities/comment.entity';
import { CommentMessages } from '../enums/comment-messages';
import { commentStub } from '../stub/comment.stub';

export const CommentsService = jest.fn().mockReturnValue({
  getPostComments: jest.fn().mockResolvedValue([commentStub()]),

  create: jest.fn().mockResolvedValue(commentStub()),

  delete: jest.fn().mockResolvedValue(commentStub().id),

  update: jest.fn((comment: Comment, dto: UpdateCommentDto) =>
    Promise.resolve({ ...comment, ...dto }),
  ),
});
