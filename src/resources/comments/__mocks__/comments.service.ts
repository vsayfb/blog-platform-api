import { UpdateCommentDto } from '../request-dto/update-comment.dto';
import { Comment } from '../entities/comment.entity';
import { commentStub } from '../stub/comment.stub';

export const CommentsService = jest.fn().mockReturnValue({
  create: jest.fn().mockResolvedValue(commentStub()),
  replyToComment: jest.fn().mockResolvedValue(commentStub()),
  getPostComments: jest.fn().mockResolvedValue([commentStub()]),
  getCommentReplies: jest.fn().mockResolvedValue([commentStub()]),
  getAccountComments: jest.fn().mockResolvedValue([commentStub()]),
  getOneByID: jest.fn().mockResolvedValue(commentStub()),
  delete: jest.fn().mockResolvedValue(commentStub().id),
  update: jest.fn((comment: Comment, dto: UpdateCommentDto) =>
    Promise.resolve({ ...comment, ...dto }),
  ),
  getAll: jest.fn().mockResolvedValue([commentStub()]),
});
