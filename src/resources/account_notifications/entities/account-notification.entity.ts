import { Account } from 'src/resources/accounts/entities/account.entity';
import { PostComment } from 'src/resources/comments/entities/post-comment.entity';
import { Post } from 'src/resources/posts/entities/post.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum NotificationActions {
  FOLLOWED = 'followed you',
  COMMENTED_POST = 'commented on your post',
  REPLIED_COMMENT = 'replied your comment',
  LIKED_POST = 'liked your post',
  DISLIKED_POST = 'disliked your post',
  LIKED_COMMENT = 'liked your comment',
  DISLIKED_COMMENT = 'disliked your comment',
}

export enum NotificationObject {
  POST = 'post',
  FOLLOW = 'follow',
  POST_COMMENT = 'comment',
  COMMENT_REPLY = 'reply',
}

@Entity()
export class AccountNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account, { eager: true, onDelete: 'CASCADE' })
  sender: Account;

  @ManyToOne(() => Account, { eager: true, onDelete: 'CASCADE' })
  notifable: Account;

  @ManyToOne(() => Post, { eager: true, nullable: true, onDelete: 'CASCADE' })
  post?: Post;

  @ManyToOne(() => PostComment, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
  })
  comment?: PostComment;

  @ManyToOne(() => PostComment, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
  })
  reply?: PostComment;

  @Column({ type: 'enum', enum: NotificationActions })
  action: NotificationActions;

  @Column({ type: 'enum', enum: NotificationObject })
  object: NotificationObject;

  @Column({ default: false })
  seen: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
