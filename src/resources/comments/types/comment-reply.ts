import { SelectedAccountFields } from 'src/resources/accounts/types/selected-account-fields';
import { SelectedCommentFields } from './selected-comment-fields';

export type CommentReply = SelectedCommentFields & {
  author: SelectedAccountFields;
  like_count: number;
  dislike_count: number;
  reply_count: number;
  created_at: Date;
};
