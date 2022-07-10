import { CreateCommentDto } from '../dto/create-comment.dto';
import { Comment } from '../entities/comment.entity';
import { CommentMessages } from '../enums/comment-messages';
import { commentStub } from '../stub/comment.stub';

export const CommentsService = jest.fn().mockReturnValue({
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
});
