import { MessageViewDto } from 'src/messages/dto/message-view.dto';
import { SelectedAccountFields } from '../../accounts/types/selected-account-fields';

export type ChatViewDto = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  last_message: MessageViewDto;
};
