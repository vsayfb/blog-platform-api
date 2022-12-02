import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { Tag } from 'src/tags/entities/tag.entity';
import { SelectedPostFields } from '../types/selected-post-fields';

export type PublicPostsDto = SelectedPostFields &
  {
    author: SelectedAccountFields;
    tags: Tag[];
    comment_count: number;
    like_count: number;
  }[];
