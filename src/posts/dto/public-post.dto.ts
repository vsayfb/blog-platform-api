import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { SelectedCommentFields } from 'src/comments/types/selected-comment-fields';
import { Tag } from 'src/tags/entities/tag.entity';
import { SelectedPostFields } from '../types/selected-post-fields';

export type PublicPostDto = SelectedPostFields & {
  tags: Tag[];
  author: SelectedAccountFields;
  comments: SelectedCommentFields[];
  bookmarks_count: number;
};
