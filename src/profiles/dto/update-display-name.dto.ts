import { MaxLength, MinLength } from 'class-validator';

export class UpdateDisplayNameDto {
  @MinLength(2)
  @MaxLength(16)
  display_name: string;
}
