import { SelectedAccountFields } from '../../accounts/types/selected-account-fields';

export type ChatMessage = {
  id: string;
  chat_id: string;
  content: string;
  sender: SelectedAccountFields;
  seen: boolean;
  created_at: Date;
  updated_at: Date;
};
