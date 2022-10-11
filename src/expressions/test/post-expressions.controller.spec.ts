import { Test, TestingModule } from '@nestjs/testing';
import { jwtPayloadStub } from 'src/auth/stub/jwt-payload.stub';
import { CaslAbilityFactory } from 'src/global/casl/casl-ability.factory';
import { ExpressionMessages } from '../enums/expressions-messages';
import { ExpressionsService } from '../services/expressions.service';
import { expressionStub } from '../stub/expression-stub';
import { PostExpressionsController } from '../controllers/post-expressions.controller';
import { postStub } from 'src/posts/stub/post-stub';
import {
  ExpressionSubject,
  ExpressionType,
} from '../entities/expression.entity';
import { CreatedPostExpressionDto } from '../dto/created-post-expression.dto';
import { MANAGE_DATA_SERVICE } from 'src/lib/constants';

jest.mock('src/expressions/services/expressions.service');

describe('PostExpressionsController', () => {
  let postExpressionsController: PostExpressionsController;
  let expressionsService: ExpressionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostExpressionsController],
      providers: [
        ExpressionsService,
        { provide: MANAGE_DATA_SERVICE, useClass: ExpressionsService },
        CaslAbilityFactory,
      ],
    }).compile();

    postExpressionsController = module.get<PostExpressionsController>(
      PostExpressionsController,
    );
  });

  describe('like', () => {
    describe('when like is called', () => {
      let result: {
        data: CreatedPostExpressionDto;
        message: ExpressionMessages;
      };
      const account = jwtPayloadStub();
      const postID = postStub().id;

      beforeEach(async () => {
        result = await postExpressionsController.like(account, postID);
      });

      it('should return the created expression', () => {
        expect(result.data).toEqual(expressionStub());
      });
    });
  });

  describe('dislike', () => {
    describe('when dislike is called', () => {
      let result: {
        data: CreatedPostExpressionDto;
        message: ExpressionMessages;
      };
      const account = jwtPayloadStub();
      const postID = postStub().id;

      beforeEach(async () => {
        result = await postExpressionsController.dislike(account, postID);
      });

      it('should return the created expression', () => {
        expect(result.data).toEqual(expressionStub());
      });
    });
  });
});
