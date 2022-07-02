import { NotFoundException } from '@nestjs/common';

export interface ICrudService<T> {
  getOne(
    where: string,
  ): Promise<{ data: T; message: string } | NotFoundException>;
  getAll(): Promise<{ data: T[]; message: string }>;
  create(data: any): Promise<{ data: T; message: string }>;
  getOneByID(id: string): Promise<T>;
  delete(id: string): Promise<{ id: string; message: string }>;
  update(id: string, data: any): Promise<{ data: T; message: string }>;
}
