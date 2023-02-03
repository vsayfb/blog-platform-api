import { IntersectionType } from '@nestjs/mapped-types';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { TagMessages } from 'src/resources/tags/enums/tag-messages';
import { PostContentDto } from './post-content.dto';
import { PostTitleDto } from './post-title-dto';

export class UpdatePostDto extends IntersectionType(
  PostTitleDto,
  PostContentDto,
) {
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
