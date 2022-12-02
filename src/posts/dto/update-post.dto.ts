import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TagMessages } from 'src/tags/enums/tag-messages';

export class UpdatePostDto {
  @MinLength(15)
  @MaxLength(34)
  title: string;

  @MinLength(15)
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Length(2, 20, { message: TagMessages.MUST_BETWEEN, each: true })
  @ArrayMaxSize(3, { message: TagMessages.MAX_THREE_ELEMENTS })
  @Matches(/^[a-zA-Z-]+$/, {
    each: true,
    message: TagMessages.ONLY_CONTAIN_LETTERS,
  })
  tags: string[];
}
