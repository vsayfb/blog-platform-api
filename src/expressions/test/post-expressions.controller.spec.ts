import { Test, TestingModule } from '@nestjs/testing';
import { jwtPayloadStub } from 'src/auth/stub/jwt-payload.stub';
import { CaslAbilityFactory } from 'src/global/casl/casl-ability.factory';
import { ExpressionMessages } from '../enums/expressions-messages';
import { ExpressionsService } from '../services/expressions.service';
import { expressionStub } from '../stub/expression-stub';
import { PostExpressionsController } from '../controllers/post-expressions.controller';
import { PostExpressionsService } from '../services/post-expressions.service';
import { postStub } from 'src/posts/stub/post-stub';
import { ExpressionType } from '../entities/expression.entity';
import { CreatedPostExpressionDto } from '../dto/created-post-expression.dto';
import { MANAGE_DATA_SERVICE } from 'src/lib/constants';

jest.mock('src/expressions/services/expressions.service');
jest.mock('src/expressions/services/post-expressions.service');

describe('PostExpressionsController', () => {
  let postExpressionsController: PostExpressionsController;
  let postExpressionsService: PostExpressionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostExpressionsController],
      providers: [
        PostExpressionsService,
        ExpressionsService,
        { provide: MANAGE_DATA_SERVICE, useClass: ExpressionsService },
        CaslAbilityFactory,
      ],
    }).compile();

    postExpressionsController = module.get<PostExpressionsController>(
      PostExpressionsController,
    );
    postExpressionsService = module.get<PostExpressionsService>(
      PostExpressionsService,
    );
  });

  describe('likePost', () => {
    describe('when likePost is called', () => {
      let result: {
        data: CreatedPostExpressionDto;
        message: ExpressionMessages;
      };
      const account = jwtPayloadStub();
      const postID = postStub().id;

      beforeEach(async () => {
        result = await postExpressionsController.likePost(account, postID);
      });

      test('calls postExpressionsService.createPostExpression', () => {
        expect(
          postExpressionsService.createPostExpression,
        ).toHaveBeenCalledWith({
          postID,
          type: ExpressionType.LIKE,
          accountID: account.sub,
        });
      });

      it('should return the created expression', () => {
        expect(result.data).toEqual(expressionStub());
      });
    });
  });

  describe('dislikePost', () => {
    describe('when dislikePost is called', () => {
      let result: {
        data: CreatedPostExpressionDto;
        message: ExpressionMessages;
      };
      const account = jwtPayloadStub();
      const postID = postStub().id;

      beforeEach(async () => {
        result = await postExpressionsController.dislikePost(account, postID);
      });

      test('calls postExpressionsService.createPostExpression', () => {
        expect(
          postExpressionsService.createPostExpression,
        ).toHaveBeenCalledWith({
          postID,
          type: ExpressionType.DISLIKE,
          accountID: account.sub,
        });
      });

      it('should return the created expression', () => {
        expect(result.data).toEqual(expressionStub());
      });
    });
  });
});
