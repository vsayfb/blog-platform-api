import { expressionStub } from 'src/expressions/stub/expression-stub';

export const ExpressionsService = jest.fn().mockReturnValue({
  getOneByID: jest.fn().mockResolvedValue(expressionStub()),
  getAccountExpressions: jest.fn().mockResolvedValue([expressionStub()]),
  delete: jest.fn().mockResolvedValue(expressionStub().id),
  create: jest.fn().mockResolvedValue(expressionStub()),
});
