import { Role } from '../entities/account.entity';

export type SelectedAccountFields = {
  id: string;
  username: string;
  display_name: string;
  image: string | null;
  role: Role;
  created_at: Date;
};
