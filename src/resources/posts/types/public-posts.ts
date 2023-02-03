import { SelectedAccountFields } from 'src/resources/accounts/types/selected-account-fields';
import { SelectedTagFields } from 'src/resources/tags/types/selected-tag-fields';
import { SelectedPostFields } from '../types/selected-post-fields';

export type PublicPosts = SelectedPostFields &
  {
    author: SelectedAccountFields;
    tags: SelectedTagFields[];
    comment_count: number;
    like_count: number;
  }[];
