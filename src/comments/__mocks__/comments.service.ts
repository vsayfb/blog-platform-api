import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { Comment } from '../entities/comment.entity';
import { CommentMessages } from '../enums/comment-messages';
import { commentStub } from '../stub/comment.stub';

export const CommentsService = jest.fn().mockReturnValue({
  getPostComments: jest
    .fn()
    .mockResolvedValue({
      data: [commentStub()],
      message: CommentMessages.POST_COMMENTS_FOUND,
    }),

  create: jest.fn(
    (_authorID: string, _postID: string, _createCommentDto: CreateCommentDto) =>
      Promise.resolve({
        data: commentStub(),
        message: CommentMessages.CREATED,
      }),
  ),

  delete: jest.fn((comment: Comment) =>
    Promise.resolve({ id: comment.id, message: CommentMessages.DELETED }),
  ),
  update: jest.fn((comment: Comment, dto: UpdateCommentDto) =>
    Promise.resolve({
      data: { ...comment, ...dto },
      message: CommentMessages.UPDATED,
    }),
  ),
});
