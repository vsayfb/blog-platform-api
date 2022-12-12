import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { SelectedCommentFields } from '../types/selected-comment-fields';

export type ReplyViewDto = SelectedCommentFields & {
  author: SelectedAccountFields;
  parent: SelectedCommentFields & { author: SelectedAccountFields };
  post: {
    id: string;
    title: string;
    title_image: string | null;
    url: string;
    content: string;
    published: true;
    created_at: string;
    updated_at: string;
  };
};
