import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { SelectedCommentFields } from '../types/selected-comment-fields';

export type ReplyViewDto = SelectedCommentFields & {
  parent: SelectedCommentFields;
  author: SelectedAccountFields;
};
