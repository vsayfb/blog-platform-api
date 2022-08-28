import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { SelectedPostFields } from 'src/posts/types/selected-post-fields';
import { SelectedTagFields } from 'src/tags/types/selected-tag-fields';

export type CreatedCommentDto = {
  id: string;
  content: string;
  author: SelectedAccountFields;
  post: SelectedPostFields & {
    author: SelectedAccountFields;
    tags: SelectedTagFields[];
  };
  created_at: Date;
  updated_at: Date;
};
