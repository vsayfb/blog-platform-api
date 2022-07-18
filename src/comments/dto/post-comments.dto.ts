import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { SelectedCommentFields } from '../types/selected-comment-fields';

export type PostCommentsDto = SelectedCommentFields &
  {
    author: SelectedAccountFields;
  }[];
