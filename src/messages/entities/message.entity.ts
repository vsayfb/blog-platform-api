import {
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
import { Chat } from '../../chats/entities/chat.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Chat, { onDelete: 'CASCADE' })
  chat: Chat;

  @ManyToOne(() => Account, { onDelete: 'CASCADE', eager: true })
  sender: Account;

  @Column()
  content: string;

  @Column({ type: 'boolean', default: false })
  seen: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
