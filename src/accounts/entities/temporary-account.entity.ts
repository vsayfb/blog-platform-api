import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class TemporaryAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  display_name: string;

  @Column({ unique: true, nullable: true })
  mobile_phone: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  created_at: Date;
}
