import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { CreatePostDto } from 'src/posts/dto/create-post.dto';
import { TagMessages } from '../enums/tag-messages';

export class TagsPipe implements PipeTransform {
  transform(dto: CreatePostDto, _metadata: ArgumentMetadata) {
    let parsedTags: string[] = [];

    try {
      // maybe tags are sent in a form data
      parsedTags = JSON.parse(dto.tags as unknown as string);
    } catch (err) {
      parsedTags = dto.tags;
    }

    if (!parsedTags || !parsedTags.length) {
      dto.tags = [];

      return dto;
    } else if (parsedTags.length > 3) {
      throw new BadRequestException(TagMessages.MAX_THREE_ELEMENTS);
    } else {
      const acceptedLength = parsedTags.every(
        (t) => t.length > 1 && t.length < 21,
      );

      if (!acceptedLength)
        throw new BadRequestException(TagMessages.MUST_BETWEEN);

      const acceptedValue = parsedTags.every((t) => t.match(/^[a-zA-Z-]+$/));

      if (!acceptedValue)
        throw new BadRequestException(TagMessages.ONLY_CONTAIN_LETTERS);
    }

    return { ...dto, tags: parsedTags };
  }
}
