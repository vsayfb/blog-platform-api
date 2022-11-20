import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { TagMessages } from '../enums/tag-messages';

export class CreateTagDto {
  @IsOptional()
  @IsString()
  @Length(2, 20, {
    message:
      'Tag name must be longer than or equal to 2 and shorter than or equal to 20 characters.',
  })
  @Matches(/^[a-zA-Z-]+$/, {
    message: TagMessages.ONLY_CONTAIN_LETTERS,
  })
  name: string;
}
