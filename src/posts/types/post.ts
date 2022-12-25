import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { SelectedTagFields } from 'src/tags/types/selected-tag-fields';
import { SelectedPostFields } from './selected-post-fields';

// public and private post
export type PostType = SelectedPostFields & {
  author: SelectedAccountFields;
  tags: SelectedTagFields[];
};
