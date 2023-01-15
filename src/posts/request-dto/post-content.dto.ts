import { MinLength } from 'class-validator';
import { IsNotBlank } from 'src/lib/validators/is-not-blank';

export class PostContentDto {
  @MinLength(15)
  @IsNotBlank()
  content: string;
}
