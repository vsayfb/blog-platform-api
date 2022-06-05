import { Column, Entity, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

export enum RegisterType {
  LOCAL = 'local',
  GOOGLE = 'google',
}

@Entity()
export class Account extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ unique: true, length: 22 })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ length: 22 })
  password: string;

  @Column({ type: 'enum', default: RegisterType.LOCAL, enum: RegisterType })
  via: RegisterType;
}
