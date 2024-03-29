import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PostMessages } from '../enums/post-messages';
import { PostsService } from '../services/posts.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class CheckPostExists implements ValidatorConstraintInterface {
  constructor(private readonly postsService: PostsService) {}

  async validate(id: string, args: ValidationArguments) {
    const post = await this.postsService.getOneByID(id);

    return !post;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return PostMessages.NOT_FOUND;
  }
}

export function PostExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: PostExists,
    });
  };
}
