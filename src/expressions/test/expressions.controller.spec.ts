import { Test, TestingModule } from '@nestjs/testing';
import { jwtPayloadStub } from 'src/auth/stub/jwt-payload.stub';
import { CaslAbilityFactory } from 'src/global/casl/casl-ability.factory';
import { AccountExpressionsDto } from '../dto/account-expressions.dto';
import { ExpressionMessages } from '../enums/expressions-messages';
import { ExpressionsController } from '../controllers/expressions.controller';
import { ExpressionsService } from '../services/expressions.service';
import { expressionStub } from '../stub/expression-stub';

jest.mock('src/expressions/services/expressions.service');

describe('ExpressionsController', () => {
  let expressionsController: ExpressionsController;
  let expressionsService: ExpressionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpressionsController],
      providers: [
        ExpressionsService,
        { provide: 'SERVICE', useClass: ExpressionsService },
        CaslAbilityFactory,
      ],
    }).compile();

    expressionsController = module.get<ExpressionsController>(
      ExpressionsController,
    );
    expressionsService = module.get<ExpressionsService>(ExpressionsService);
  });

  describe('findMyExpressions', () => {
    describe('when findMyExpressions is called', () => {
      let result: {
        data: AccountExpressionsDto[];
        message: ExpressionMessages;
      };
      const me = jwtPayloadStub();

      beforeEach(async () => {
        result = await expressionsController.findMyExpressions(me);
      });

      test('calls expressionsService.getAccountExpressions', () => {
        expect(expressionsService.getAccountExpressions).toHaveBeenCalledWith(
          me.sub,
        );
      });

      it('should return an array of expressions', () => {
        expect(result.data).toEqual([expressionStub()]);
      });
    });
  });

  describe('remove', () => {
    describe('when remove is called', () => {
      let result: { id: string; message: ExpressionMessages };
      const expression = expressionStub();

      beforeEach(async () => {
        result = await expressionsController.remove(expression);
      });

      test('calls expressionsService.delete', () => {
        expect(expressionsService.delete).toHaveBeenCalledWith(expression);
      });

      it("should return removed expression's id", () => {
        expect(result.id).toEqual(expression.id);
      });
    });
  });
});
