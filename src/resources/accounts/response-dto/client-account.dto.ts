import { Role } from '../entities/account.entity';

export type ClientAccountDto = {
  id: string;
  username: string;
  display_name: string;
  image: string | null;
  role: Role;
  created_at: Date;
  mobil_phone: string | null;
  email: string | null;
};
