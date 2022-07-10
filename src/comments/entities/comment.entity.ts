import { Account } from 'src/accounts/entities/account.entity';
import { Post } from 'src/posts/entities/post.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account, (account) => account.comments, { eager: true })
  author: Account;

  @ManyToOne(() => Post, (post) => post.comments)
  post: Post;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
