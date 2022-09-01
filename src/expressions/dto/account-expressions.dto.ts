import { SelectedPostFields } from 'src/posts/types/selected-post-fields';
import { ExpressionType } from '../entities/expression.entity';

export type AccountExpressionsDto = {
  id: string;

  post?: SelectedPostFields;

  type: ExpressionType;

  created_at: Date;
};
