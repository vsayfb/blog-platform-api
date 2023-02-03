import { SelectedPostFields } from 'src/resources/posts/types/selected-post-fields';
import { SelectedCommentFields } from './selected-comment-fields';

export type AccountComment = SelectedCommentFields & {
  post: SelectedPostFields;
};
