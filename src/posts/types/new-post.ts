import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { SelectedTagFields } from 'src/tags/types/selected-tag-fields';
import { SelectedPostFields } from './selected-post-fields';

export type NewPost = SelectedPostFields & {
  author: SelectedAccountFields;
  tags: SelectedTagFields[];
  published: boolean;
};
