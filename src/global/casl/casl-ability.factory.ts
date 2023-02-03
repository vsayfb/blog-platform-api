import { JwtPayload } from 'src/lib/jwt.payload';
import { Post } from 'src/resources/posts/entities/post.entity';
import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Role, Account } from 'src/resources/accounts/entities/account.entity';
import { Tag } from 'src/resources/tags/entities/tag.entity';
import { Comment } from 'src/resources/comments/entities/comment.entity';
import { Bookmark } from 'src/resources/bookmarks/entities/bookmark.entity';
import { Notification } from 'src/resources/account_notifications/entities/notification.entity';
import { TwoFactorAuth } from 'src/resources/tfa/entities/two-factor-auth.entity';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type Subjects =
  | InferSubjects<
      | typeof Post
      | typeof Tag
      | typeof Comment
      | typeof Bookmark
      | typeof Notification
      | typeof Account
      | typeof TwoFactorAuth
    >
  | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForClient({ client }: { client: JwtPayload }) {
    const { can, build } = new AbilityBuilder<Ability<[Action, Subjects]>>(
      Ability as AbilityClass<AppAbility>,
    );

    if (client.role === Role.ADMIN) {
      can(Action.Manage, 'all');
    } //
    else if (client.role === Role.MODERATOR) {
      can(Action.Manage, Tag);
      can(Action.Manage, Comment);
      can(Action.Manage, Post);
    } //
    else {
      can(Action.Manage, Post, { 'author.id': client.sub } as unknown as Post);

      can(Action.Manage, Comment, {
        'author.id': client.sub,
      } as unknown as Comment);

      can(Action.Manage, Bookmark, {
        'account.id': client.sub,
      } as unknown as Bookmark);

      can(Action.Manage, Notification, {
        'notifable.id': client.sub,
      } as unknown as Notification);

      can(Action.Manage, TwoFactorAuth, {
        'account.id': client.sub,
      } as unknown as TwoFactorAuth);

      can(Action.Manage, Account, {
        username: client.username,
      });

      /* since casl cannot match nested objects, dot notation must be used. so as unknown as Type
      can(Action.Update, Post, { author:{ id: client.sub} }) */ // that doesn't work
    }

    return build({
      detectSubjectType: (item) => {
        return item.constructor as ExtractSubjectType<Subjects>;
      },
    });
  }
}
