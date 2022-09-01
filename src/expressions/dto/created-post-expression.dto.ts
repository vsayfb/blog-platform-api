import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { SelectedPostFields } from 'src/posts/types/selected-post-fields';
import { ExpressionType } from '../entities/expression.entity';

export type CreatedPostExpressionDto = {
  id: string;
  left: SelectedAccountFields;
  post: SelectedPostFields;
  type: ExpressionType;
  created_at: Date;
};
