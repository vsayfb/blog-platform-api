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

export enum Role {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

@Entity()
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({})
  display_name: string;

  @Column({ unique: true, select: false })
  email: string;

  @Column({ nullable: true, default: null })
  image: string | null;

  @Column({ select: false })
  password: string;

  @OneToMany((_type) => Post, (post) => post.author)
  posts: Post[];

  @Column({ type: 'enum', default: RegisterType.LOCAL, enum: RegisterType })
  via: RegisterType;

  @Column({ type: 'enum', default: Role.USER, enum: Role })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
