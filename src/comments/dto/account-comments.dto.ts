import { SelectedPostFields } from 'src/posts/types/selected-post-fields';
import { SelectedCommentFields } from '../types/selected-comment-fields';

export type AccountCommentsDto = SelectedCommentFields &
  {
    post: SelectedPostFields;
  }[];
