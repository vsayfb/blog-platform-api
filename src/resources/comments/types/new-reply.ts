import { SelectedAccountFields } from 'src/resources/accounts/types/selected-account-fields';
import { SelectedPostFields } from 'src/resources/posts/types/selected-post-fields';
import { SelectedCommentFields } from './selected-comment-fields';

export type NewReply = SelectedCommentFields & {
  author: SelectedAccountFields;
  parent: SelectedCommentFields & { author: SelectedAccountFields };
  post: SelectedPostFields;
};
