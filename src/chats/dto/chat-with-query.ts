import { IsUUID } from 'class-validator';
import { AccountExists } from 'src/accounts/validators/check-exists-by-id';

export class ChatWithQueryID {
  @IsUUID()
  @AccountExists()
  with_account_id: string;
}
