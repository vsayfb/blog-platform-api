import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { SelectedPostFields } from 'src/posts/types/selected-post-fields';

export type CreatedCommentDto = {
  id: string;
  content: string;
  author: SelectedAccountFields;
  post: SelectedPostFields;
  created_at: Date;
  updated_at: Date;
};
