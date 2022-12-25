import { SelectedAccountFields } from '../../accounts/types/selected-account-fields';

export type ChatMessage = {
  chat_id: string;
  content: string;
  sender: SelectedAccountFields;
  created_at: Date;
  updated_at: Date;
};
