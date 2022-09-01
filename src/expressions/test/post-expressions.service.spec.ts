import { Test, TestingModule } from '@nestjs/testing';
import { jwtPayloadStub } from 'src/auth/stub/jwt-payload.stub';
import { ExpressionsService } from '../services/expressions.service';
import { expressionStub } from '../stub/expression-stub';
import { PostExpressionsService } from '../services/post-expressions.service';
import { postStub } from 'src/posts/stub/post-stub';
import { Expression, ExpressionType } from '../entities/expression.entity';
import { CreatedPostExpressionDto } from '../dto/created-post-expression.dto';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockRepository } from '../../../test/utils/mockRepository';
import { ExpressionMessages } from '../enums/expressions-messages';

describe('PostExpressionsService', () => {
  let postExpressionsService: PostExpressionsService;
  let expressionsRepository: Repository<Expression>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostExpressionsService,
        ExpressionsService,
        {
          provide: getRepositoryToken(Expression),
          useClass: Repository<Expression>,
        },
      ],
    }).compile();

    postExpressionsService = module.get<PostExpressionsService>(
      PostExpressionsService,
    );

    expressionsRepository = module.get<Repository<Expression>>(
      getRepositoryToken(Expression),
    );

    mockRepository(expressionsRepository, Expression);
  });

  describe('createPostExpression', () => {
    describe('when createPostExpression is called', () => {
      let result: CreatedPostExpressionDto;
      const account = jwtPayloadStub();
      const postID = postStub().id;
      const expressionType = ExpressionType.LIKE;

      describe('scenario : if an expression already left', () => {
        test('should throw already left error', async () => {
          await expect(
            postExpressionsService.createPostExpression({
              postID,
              accountID: account.sub,
              type: expressionType,
            }),
          ).rejects.toThrow(ExpressionMessages.ALREADY_LEFT_TO_POST);
        });
      });

      describe('scenario : if an expression did not leave', () => {
        beforeEach(async () => {
          jest
            .spyOn(postExpressionsService, 'checkAlreadyLeft' as any)
            .mockResolvedValueOnce(null);

          result = await postExpressionsService.createPostExpression({
            postID,
            accountID: account.sub,
            type: expressionType,
          });
        });

        test('calls expressionsRepository.save', () => {
          expect(expressionsRepository.save).toHaveBeenCalledWith({
            post: { id: postID },
            left: { id: account.sub },
            type: expressionType,
          });
        });

        test('calls expressionsRepository.findOne', () => {
          expect(expressionsRepository.findOne).toHaveBeenCalledWith({
            where: { id: expressionStub().id },
            relations: { left: true, post: true },
          });
        });

        it('should return the created expression', () => {
          expect(result).toEqual(expressionStub());
        });
      });
    });
  });
});
