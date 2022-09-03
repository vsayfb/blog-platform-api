import { Test, TestingModule } from '@nestjs/testing';
import { jwtPayloadStub } from 'src/auth/stub/jwt-payload.stub';
import { CaslAbilityFactory } from 'src/global/casl/casl-ability.factory';
import { JwtPayload } from 'src/lib/jwt.payload';
import { CommentsNotificationService } from 'src/global/notifications/services/comments-notification.service';
import { postStub } from 'src/posts/stub/post-stub';
import { CommentsController } from '../comments.controller';
import { CommentsService } from '../comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { Comment } from '../entities/comment.entity';
import { CommentMessages } from '../enums/comment-messages';
import { commentStub } from '../stub/comment.stub';
import { SelectedCommentFields } from '../types/selected-comment-fields';
import { GatewayEventsService } from 'src/global/events/gateway-events.service';
import { CommentViewDto } from '../dto/comment-view.dto';
import { RepliesViewDto } from '../dto/replies-view.dto';
import { MANAGE_DATA_SERVICE } from 'src/lib/constants';

jest.mock('src/comments/comments.service');
jest.mock('src/global/events/gateway-events.service');

describe('CommentsController', () => {
  let commentsController: CommentsController;
  let commentsService: CommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        CommentsService,
        GatewayEventsService,
        { provide: CommentsNotificationService, useValue: {} },
        { provide: MANAGE_DATA_SERVICE, useClass: CommentsService },
        CaslAbilityFactory,
      ],
    }).compile();

    commentsController = module.get<CommentsController>(CommentsController);
    commentsService = module.get<CommentsService>(CommentsService);
  });

  describe('findPostComments', () => {
    describe('when findPostComments is called', () => {
      let result: { data: CommentViewDto[]; message?: CommentMessages };
      const postID = postStub().id;

      beforeEach(async () => {
        result = await commentsController.findPostComments(postID);
      });

      test('calls commentsService.getPostComments', () => {
        expect(commentsService.getPostComments).toHaveBeenCalledWith(postID);
      });

      it('should return an array of comments of the found post', () => {
        expect(result.data).toEqual([commentStub()]);
      });
    });
  });

  describe('findCommentReplies', () => {
    describe('when findCommentReplies is called', () => {
      let result: { data: RepliesViewDto; message?: CommentMessages };
      const commentID = commentStub().id;

      beforeEach(async () => {
        result = await commentsController.findCommentReplies(commentID);
      });

      test('calls commentsService.getCommentReplies', () => {
        expect(commentsService.getCommentReplies).toHaveBeenCalledWith(
          commentID,
        );
      });

      it('should return an array of replies of the found comment', () => {
        expect(result.data).toEqual([commentStub()]);
      });
    });
  });

  describe('replyToReply', () => {
    describe('when replyToComment is called', () => {
      let result: { data: SelectedCommentFields; message: string };
      const account: JwtPayload = jwtPayloadStub();
      const commentID = commentStub().id;
      const dto: CreateCommentDto = {
        content: commentStub().content,
      };

      beforeEach(async () => {
        result = await commentsController.replyToComment(
          account,
          commentID,
          dto,
        );
      });

      test('calls commentsService.replyToComment', () => {
        expect(commentsService.replyToComment).toHaveBeenCalledWith({
          authorID: account.sub,
          toID: commentID,
          dto,
        });
      });

      it('should return the created reply', () => {
        expect(result.data).toEqual(commentStub());
      });
    });
  });

  describe('create', () => {
    describe('when create is called', () => {
      let result: { data: SelectedCommentFields; message: string };
      const account: JwtPayload = jwtPayloadStub();
      const postID = postStub().id;
      const dto: CreateCommentDto = {
        content: commentStub().content,
      };

      beforeEach(async () => {
        result = await commentsController.create(account, postID, dto);
      });

      test('calls commentsService.create', () => {
        expect(commentsService.create).toHaveBeenCalledWith({
          authorID: account.sub,
          createCommentDto: { content: dto.content },
          postID,
        });
      });

      it('should return the created comment', () => {
        expect(result.data).toEqual(commentStub());
      });
    });
  });

  describe('delete', () => {
    describe('when delete is called', () => {
      let result: { id: string; message?: string };

      const comment = commentStub() as Comment;

      beforeEach(async () => {
        result = await commentsController.remove(comment);
      });

      test('calls commentsService.delete', () => {
        expect(commentsService.delete).toHaveBeenCalledWith(comment);
      });

      it("should return the deleted comment's id", () => {
        expect(result.id).toEqual(comment.id);
      });
    });
  });

  describe('update', () => {
    describe('when update is called', () => {
      let result: { data: SelectedCommentFields; message: string };

      const comment = commentStub() as Comment;
      const dto: UpdateCommentDto = {
        content: 'updated-comment',
      };

      beforeEach(async () => {
        result = await commentsController.update(comment, dto);
      });

      test('calls commentsService.update', () => {
        expect(commentsService.update).toHaveBeenCalledWith(comment, dto);
      });

      it('should return the updated comment', () => {
        expect(result.data.content).toEqual(dto.content);
      });
    });
  });
});
