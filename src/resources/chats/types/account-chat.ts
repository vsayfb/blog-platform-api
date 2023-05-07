import { SelectedAccountFields } from 'src/resources/accounts/types/selected-account-fields';
import { ChatMessageType } from 'src/resources/messages/types/new-message';

export type AccountChat = {
  id: string;
  members: SelectedAccountFields[];
  last_message: ChatMessageType;
  created_at: Date;
  updated_at: Date;
};
