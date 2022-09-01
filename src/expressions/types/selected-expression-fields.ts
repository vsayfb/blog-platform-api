import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { ExpressionType } from '../entities/expression.entity';

export type SelectedExpressionFields = {
  id: string;
  left: SelectedAccountFields;
  type: ExpressionType;
  created_at: Date;
};
