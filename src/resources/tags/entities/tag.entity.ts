import { Post } from 'src/resources/posts/entities/post.entity';
import { Account } from 'src/resources/accounts/entities/account.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @ManyToOne(() => Account)
  author: Account;

  @ManyToMany(() => Post, (post) => post.tags, { cascade: true })
  posts: Post[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
