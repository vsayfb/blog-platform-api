import { MinLength } from 'class-validator';
import { IsNotBlank } from 'src/lib/validators/is-not-blank';

export class CreateMessageDto {
  @MinLength(1)
  @IsNotBlank()
  content: string;
}
