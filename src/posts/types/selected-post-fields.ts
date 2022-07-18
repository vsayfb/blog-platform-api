import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { Tag } from 'src/tags/entities/tag.entity';

export type SelectedPostFields = {
  author: any;
  id: string;
  title: string;
  title_image: string | null;
  url: string;
  content: string;
  published: boolean;
  created_at: Date;
  updated_at: Date;
};
