import { Length } from 'class-validator';
import { IsNotBlank } from 'src/lib/validators/is-not-blank';

export class DisplayNameDto {
  @Length(2, 16)
  @IsNotBlank()
  display_name: string;
}
