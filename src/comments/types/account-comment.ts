import { SelectedPostFields } from 'src/posts/types/selected-post-fields';
import { SelectedCommentFields } from './selected-comment-fields';

export type AccountComment = SelectedCommentFields & {
  post: SelectedPostFields;
};
