import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { accountStub } from 'src/accounts/test/stub/account.stub';
import { mockRepository } from '../../../test/utils/mockRepository';
import { Repository } from 'typeorm';
import { Expression } from '../entities/expression.entity';
import { ExpressionsService } from '../services/expressions.service';
import { expressionStub } from '../stub/expression-stub';
import { AccountExpressionsDto } from '../dto/account-expressions.dto';

describe('ExpressionsService', () => {
  let expressionsService: ExpressionsService;
  let expressionsRepository: Repository<Expression>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpressionsService,
        {
          provide: getRepositoryToken(Expression),
          useClass: Repository<Expression>,
        },
      ],
    }).compile();

    expressionsService = module.get<ExpressionsService>(ExpressionsService);
    expressionsRepository = module.get<Repository<Expression>>(
      getRepositoryToken(Expression),
    );

    mockRepository(expressionsRepository, Expression);
  });

  describe('getOneByID', () => {
    describe('when getOneByID is called', () => {
      let result: Expression;
      const expression = expressionStub();

      beforeEach(async () => {
        result = await expressionsService.getOneByID(expression.id);
      });

      test('calls expressionsRepository.findOne', () => {
        expect(expressionsRepository.findOne).toHaveBeenCalledWith({
          where: { id: expression.id },
          relations: { left: true },
        });
      });

      it('should return an expression', () => {
        expect(result).toEqual(expressionStub());
      });
    });
  });

  describe('getAccountExpressions', () => {
    describe('when getAccountExpressions is called', () => {
      let result: AccountExpressionsDto[];
      const account = accountStub();

      beforeEach(async () => {
        result = await expressionsService.getAccountExpressions(account.id);
      });

      test('calls expressionsRepository.find', () => {
        expect(expressionsRepository.find).toHaveBeenCalledWith({
          where: { left: { id: account.id } },
          relations: { left: false },
        });
      });

      it('should be return an array of expressions', () => {
        expect(result).toEqual([expressionStub()]);
      });
    });
  });

  describe('delete', () => {
    describe('when delete is called', () => {
      let result: string;
      const expression = expressionStub();

      beforeEach(async () => {
        result = await expressionsService.delete(expression);
      });

      test('calls expressionsRepository.remove', () => {
        expect(expressionsRepository.remove).toHaveBeenCalledWith(expression);
      });

      it("should return the removed expression's id", () => {
        expect(result).toEqual(expression.id);
      });
    });
  });
});
