import { expressionStub } from 'src/expressions/stub/expression-stub';

export const PostExpressionsService = jest.fn().mockReturnValue({
  createPostExpression: jest.fn().mockResolvedValue(expressionStub()),
});
