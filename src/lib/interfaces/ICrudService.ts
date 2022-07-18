export interface ICrudService<T> {
  getOne(where: string): Promise<T | any>;
  getAll(): Promise<T[] | any[]>;
  create(data: any): Promise<T | any>;
  getOneByID(id: string): Promise<T | any>;
  delete(subject: T): Promise<string>;
  update(subject: T, updateDto: any): Promise<T | any>;
}
