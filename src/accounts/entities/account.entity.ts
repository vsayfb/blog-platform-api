import { Post } from 'src/posts/entities/post.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RegisterType {
  LOCAL = 'local',
  GOOGLE = 'google',
}

@Entity()
export class Account extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 22 })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, unique: true, default: null })
  image: string | null;

  @Column({ length: 22 })
  password: string;

  @OneToMany((_type) => Post, (post) => post.author, { cascade: true })
  posts: Post[];

  @Column({ type: 'enum', default: RegisterType.LOCAL, enum: RegisterType })
  via: RegisterType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
