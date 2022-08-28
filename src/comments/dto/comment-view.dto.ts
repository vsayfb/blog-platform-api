import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { SelectedCommentFields } from '../types/selected-comment-fields';

export type CommentViewDto = SelectedCommentFields & {
  author: SelectedAccountFields;
};
