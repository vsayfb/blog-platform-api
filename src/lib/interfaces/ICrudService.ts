import { NotFoundException } from '@nestjs/common';

export interface ICrudService<T> {
  getOne(
    where: string,
  ): Promise<{ data: T; message: string } | NotFoundException>;
  getAll(): Promise<{ data: T[]; message: string }>;
  create(data: any): Promise<{ data: T; message: string }>;
  getOneByID(id: string): Promise<{ data: T; message: string }>;
  delete(subject: T): Promise<{ id: string; message: string }>;
  update(subject: T, data: any): Promise<{ data: T; message: string }>;
}
