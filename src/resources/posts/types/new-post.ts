import { SelectedAccountFields } from 'src/resources/accounts/types/selected-account-fields';
import { SelectedTagFields } from 'src/resources/tags/types/selected-tag-fields';
import { SelectedPostFields } from './selected-post-fields';

export type NewPost = SelectedPostFields & {
  author: SelectedAccountFields;
  tags: SelectedTagFields[];
  published: boolean;
};
