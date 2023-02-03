import { Role } from 'src/resources/accounts/entities/account.entity';

export type JwtPayload = {
  sub: string;
  username: string;
  display_name: string;
  image: string | null;
  role: Role;
  iat?: number;
  exp?: number;
};
