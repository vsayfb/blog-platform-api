import { Account } from 'src/resources/accounts/entities/account.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from './comment.entity';

export enum CommentExpressionType {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

@Entity()
export class CommentExpression {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Comment, { onDelete: 'CASCADE' })
  comment: Comment;

  @Column({ type: 'enum', enum: CommentExpressionType })
  expression: CommentExpressionType;

  @ManyToOne(() => Account)
  account: Account;

  @CreateDateColumn()
  created_at: Date;
}
