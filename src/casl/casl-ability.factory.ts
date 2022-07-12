import { JwtPayload } from 'src/lib/jwt.payload';
import { Post } from './../posts/entities/post.entity';
import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Role } from 'src/accounts/entities/account.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Bookmark } from 'src/bookmarks/entities/bookmark.entity';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type Subjects =
  | InferSubjects<typeof Post | typeof Tag | typeof Comment | typeof Bookmark>
  | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser({ user }: { user: JwtPayload }) {
    const { can, build } = new AbilityBuilder<Ability<[Action, Subjects]>>(
      Ability as AbilityClass<AppAbility>,
    );

    if (user.role === Role.ADMIN) {
      can(Action.Manage, 'all');
    } //
    else if (user.role === Role.MODERATOR) {
      can(Action.Manage, Tag);
      can(Action.Manage, Comment);
    } //
    else {
      //@ts-ignore
      can(Action.Manage, Post, { 'author.id': user.sub });
      //@ts-ignore
      can(Action.Manage, Comment, { 'author.id': user.sub });

      //@ts-ignore
      can(Action.Manage, Bookmark, { 'account.id': user.sub });

      /* since casl cannot match nested objects, dot notation must be used. so ts-ignore
      can(Action.Update, Post, { author:{ id: user.sub} }) */
    }

    return build({
      detectSubjectType: (item) => {
        return item.constructor as ExtractSubjectType<Subjects>;
      },
    });
  }
}
