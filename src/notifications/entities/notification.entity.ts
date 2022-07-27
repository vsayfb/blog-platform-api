import { Account } from 'src/accounts/entities/account.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NotificationActions } from '../enums/notification-actions';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account, { eager: true, onDelete: 'CASCADE' })
  sender: Account;

  @ManyToOne(() => Account, { eager: true, onDelete: 'CASCADE' })
  notifable: Account;

  @Column({ type: 'enum', enum: NotificationActions })
  action: NotificationActions;

  @Column()
  link: string;

  @Column({ default: false })
  seen: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
