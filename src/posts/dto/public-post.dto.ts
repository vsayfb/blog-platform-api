import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { Tag } from 'src/tags/entities/tag.entity';
import { SelectedPostFields } from '../types/selected-post-fields';

export type PublicPostDto = SelectedPostFields & {
  tags: Tag[];
  author: SelectedAccountFields;
  comments: number;
  bookmarks: number;
};
