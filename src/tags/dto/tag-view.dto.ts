import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { SelectedPostFields } from 'src/posts/types/selected-post-fields';

export type TagViewDto = {
  id: string;
  name: string;
  author: SelectedAccountFields;
  posts: SelectedPostFields[];
};
