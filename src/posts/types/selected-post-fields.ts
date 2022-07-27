import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';

export type SelectedPostFields = {
  author: SelectedAccountFields;
  id: string;
  title: string;
  title_image: string | null;
  url: string;
  content: string;
  published: boolean;
  created_at: Date;
  updated_at: Date;
};
