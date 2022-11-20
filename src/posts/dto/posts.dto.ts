import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { Tag } from 'src/tags/entities/tag.entity';
import { SelectedPostFields } from '../types/selected-post-fields';

export type PostsDto = SelectedPostFields &
  {
    author: SelectedAccountFields;
    tags: Tag[];
    comments_count: number;
    bookmarks_count: number;
  }[];
