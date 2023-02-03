import { SelectedAccountFields } from 'src/resources/accounts/types/selected-account-fields';
import { SelectedTagFields } from 'src/resources/tags/types/selected-tag-fields';
import { SelectedPostFields } from './selected-post-fields';

export type AccountPost = SelectedPostFields & {
  author: SelectedAccountFields;
  tags: SelectedTagFields[];
  comments_count: number;
  bookmarks_count: number;
};
