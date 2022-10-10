import { Account } from 'src/accounts/entities/account.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Post } from 'src/posts/entities/post.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum ExpressionType {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

export enum ExpressionSubject {
  COMMENT = 'comment',
  POST = 'post',
}

@Entity()
export class Expression {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account, { onDelete: 'CASCADE', eager: true })
  @JoinColumn()
  left: Account;

  @ManyToOne(() => Post, (post) => post.expressions, { onDelete: 'CASCADE' })
  post?: Post;

  @ManyToOne(() => Comment, (comment) => comment.expressions, {
    onDelete: 'CASCADE',
  })
  comment?: Comment;

  @Column({ type: 'enum', enum: ExpressionType })
  type: ExpressionType;

  @CreateDateColumn()
  created_at: Date;
}
