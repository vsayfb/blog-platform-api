import { UpdateCommentDto } from '../dto/update-comment.dto';
import { Comment } from '../entities/comment.entity';
import { commentStub } from '../stub/comment.stub';

export const CommentsService = jest.fn().mockReturnValue({
  getPostComments: jest.fn().mockResolvedValue([commentStub()]),

  getCommentReplies: jest.fn().mockResolvedValue([commentStub()]),

  create: jest.fn().mockResolvedValue(commentStub()),

  replyToComment: jest.fn().mockResolvedValue(commentStub()),

  delete: jest.fn().mockResolvedValue(commentStub().id),

  update: jest.fn((comment: Comment, dto: UpdateCommentDto) =>
    Promise.resolve({ ...comment, ...dto }),
  ),
});
