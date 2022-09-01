import { Account } from 'src/accounts/entities/account.entity';
import { accountStub } from 'src/accounts/test/stub/account.stub';
import { Expression, ExpressionType } from '../entities/expression.entity';

export const expressionStub = (): Expression => ({
  id: 'exp-id',
  left: accountStub() as Account,
  type: ExpressionType.LIKE,
  created_at: undefined as unknown as Date,
});
