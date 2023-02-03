import { MinLength } from 'class-validator';
import { IsNotBlank } from 'src/lib/validators/is-not-blank';

export class CreateChatDto {
  @MinLength(1)
  @IsNotBlank()
  first_message: string;
}
