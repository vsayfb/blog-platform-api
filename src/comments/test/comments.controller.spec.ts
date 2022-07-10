import { Test, TestingModule } from '@nestjs/testing';
import { jwtPayloadStub } from 'src/auth/stub/jwt-payload.stub';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { JwtPayload } from 'src/lib/jwt.payload';
import { postStub } from 'src/posts/stub/post-stub';
import { CommentsController } from '../comments.controller';
import { CommentsService } from '../comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { Comment } from '../entities/comment.entity';
import { commentStub } from '../stub/comment.stub';

jest.mock('src/comments/comments.service');

describe('CommentsController', () => {
  let commentsController: CommentsController;
  let commentsService: CommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        CommentsService,
        { provide: 'SERVICE', useClass: CommentsService },
        CaslAbilityFactory,
      ],
    }).compile();

    commentsController = module.get<CommentsController>(CommentsController);
    commentsService = module.get<CommentsService>(CommentsService);
  });

  describe('create', () => {
    describe('when create is called', () => {
      let result: { data: Comment; message: string };
      const account: JwtPayload = jwtPayloadStub;
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

      const comment = commentStub();

      beforeEach(async () => {
        result = await commentsController.delete(comment);
      });

      test('calls commentsService.delete', () => {
        expect(commentsService.delete).toHaveBeenCalledWith(comment);
      });

      it("should return the deleted comment's id", () => {
        expect(result.id).toEqual(comment.id);
      });
    });
  });
});
