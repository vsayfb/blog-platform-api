import { Length } from 'class-validator';
import { IsNotBlank } from 'src/lib/validators/is-not-blank';

export class PostTitleDto {
  @Length(15, 60)
  @IsNotBlank()
  title: string;
}
