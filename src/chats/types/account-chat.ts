import { ChatMessage } from 'src/messages/types/new-message';

export type AccountChat = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  last_message: ChatMessage;
};
