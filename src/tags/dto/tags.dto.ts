import { SelectedPostFields } from 'src/posts/types/selected-post-fields';
import { SelectedTagFields } from '../types/selected-tag-fields';

export type TagsDto = SelectedTagFields &
  {
    posts: SelectedPostFields[];
  }[];
