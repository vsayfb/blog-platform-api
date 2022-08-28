import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { SelectedCommentFields } from '../types/selected-comment-fields';

export type RepliesViewDto = SelectedCommentFields &
  {
    author: SelectedAccountFields;
  }[];
