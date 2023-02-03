import { AccountExists } from 'src/resources/accounts/validators/check-exists-by-id';
import { IsNotBlank } from 'src/lib/validators/is-not-blank';

export class ChatWithQueryID {
  @AccountExists()
  @IsNotBlank()
  id: string;
}
