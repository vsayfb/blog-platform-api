import { SelectedAccountFields } from '../../accounts/types/selected-account-fields';

export type MessageViewDto = {
  chatID: string;
  content: string;
  sender: SelectedAccountFields;
  createdAt: Date;
  updatedAt: Date;
};
