import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { CreatePostDto } from 'src/posts/request-dto/create-post.dto';
import { TagMessages } from '../enums/tag-messages';

export class TagsPipe implements PipeTransform {
  transform(dto: CreatePostDto, _metadata: ArgumentMetadata) {
    let tags: string[] = [];

    try {
      // maybe tags are sent in a form data
      tags = JSON.parse(dto.tags as unknown as string);
    } catch (err) {
      tags = dto.tags;
    }

    if (!tags || !tags.length) {
      dto.tags = [];

      return dto;
    } else if (tags.length > 3) {
      throw new BadRequestException(TagMessages.MAX_THREE_ELEMENTS);
    } else {
      const acceptedLength = tags.every((t) => t.length > 1 && t.length < 21);

      if (!acceptedLength)
        throw new BadRequestException(TagMessages.MUST_BETWEEN);

      const acceptedValue = tags.every((t) => t.match(/^[a-zA-Z-]+$/));

      if (!acceptedValue)
        throw new BadRequestException(TagMessages.ONLY_CONTAIN_LETTERS);
    }

    return { ...dto, tags: tags };
  }
}
