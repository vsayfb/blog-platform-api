import { SelectedAccountFields } from 'src/resources/accounts/types/selected-account-fields';
import { SelectedCommentFields } from '../types/selected-comment-fields';

export type CommentDto = SelectedCommentFields & {
  author: SelectedAccountFields;
  like_count: number;
  dislike_count: number;
  reply_count: number;
  created_at: Date;
};
