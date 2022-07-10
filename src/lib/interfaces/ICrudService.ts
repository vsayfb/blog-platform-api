export interface ICrudService<T> {
  getOne(where: string): Promise<T>;
  getAll(): Promise<T[]>;
  create(data: any): Promise<T>;
  getOneByID(id: string): Promise<T>;
  delete(subject: T): Promise<string>;
  update(subject: T, updateDto: any): Promise<T>;
}
