import { SelectedPostFields } from 'src/posts/types/selected-post-fields';
import { SelectedBookmarkFields } from '../types/selected-bookmark-fields';

export type AccountBookmark = SelectedBookmarkFields & {
  post: SelectedPostFields;
};
