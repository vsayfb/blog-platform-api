import { SelectedAccountFields } from '../../accounts/types/selected-account-fields';

export type ChatViewDto = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  members: [SelectedAccountFields];
};
