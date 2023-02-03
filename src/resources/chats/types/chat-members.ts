import { SelectedAccountFields } from 'src/resources/accounts/types/selected-account-fields';

export type ChatWithMembers = {
  id: string;
  members: SelectedAccountFields[];
  created_at: Date;
  updated_at: Date;
};
