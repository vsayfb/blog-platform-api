import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from 'src/accounts/entities/account.entity';
import { Tag } from 'src/tags/entities/tag.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ default: null })
  titleImage: string | null;

  @ManyToOne((_type) => Account, (account) => account.posts, {
    onDelete: 'CASCADE',
    eager: true,
  })
  author: Account;

  @ManyToMany(() => Tag, (tag) => tag.posts, { eager: true, cascade: true })
  @JoinTable()
  tags: Tag[];

  @Column({ unique: true })
  url: string;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
