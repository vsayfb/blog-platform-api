import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { SelectedCommentFields } from 'src/comments/types/selected-comment-fields';
import { ExpressionType } from '../entities/expression.entity';

export type CreatedCommentExpressionDto = {
  id: string;
  left: SelectedAccountFields;
  comment: SelectedCommentFields;
  type: ExpressionType;
  created_at: Date;
};
