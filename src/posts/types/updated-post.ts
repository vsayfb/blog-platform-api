import { SelectedTagFields } from 'src/tags/types/selected-tag-fields';
import { SelectedPostFields } from '../types/selected-post-fields';

export type UpdatedPost = SelectedPostFields & {
  tags: SelectedTagFields[];
};
