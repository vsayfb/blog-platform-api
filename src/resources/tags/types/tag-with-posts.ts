import { SelectedAccountFields } from 'src/resources/accounts/types/selected-account-fields';
import { SelectedPostFields } from 'src/resources/posts/types/selected-post-fields';
import { SelectedTagFields } from './selected-tag-fields';

export type TagWithPosts = SelectedTagFields & {
  author: SelectedAccountFields;
  posts: SelectedPostFields & { author: SelectedAccountFields }[];
};
