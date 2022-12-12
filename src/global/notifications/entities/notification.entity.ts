import { Account } from 'src/accounts/entities/account.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Post } from 'src/posts/entities/post.entity';
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
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account, { eager: true, onDelete: 'CASCADE' })
  sender: Account;

  @ManyToOne(() => Account, { eager: true, onDelete: 'CASCADE' })
  notifable: Account;

  @ManyToOne(() => Post, { eager: true, nullable: true, onDelete: 'CASCADE' })
  post?: Post;

  @ManyToOne(() => Comment, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
  })
  comment?: Comment;

  @ManyToOne(() => Comment, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
  })
  reply?: Comment;

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
