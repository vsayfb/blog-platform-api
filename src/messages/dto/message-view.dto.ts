import { SelectedAccountFields } from '../../accounts/types/selected-account-fields';

export type MessageViewDto = {
  chatID: string;
  content: string;
  sender: SelectedAccountFields;
  created_at: Date;
  updated_at: Date;
};
