import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { ChatMessage } from 'src/messages/types/new-message';

export type AccountChat = {
  id: string;
  members: SelectedAccountFields[];
  last_message: ChatMessage;
  created_at: Date;
  updated_at: Date;
};
