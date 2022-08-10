export interface ICrudController<T> {
  findAll(): Promise<{ data: any[]; message: string }>;

  create(dto: any, ...args: any[]): Promise<{ data: any; message: string }>;

  findOne(where: any): Promise<{ data: any; message: string }>;

  remove(subject: T): Promise<{ id: string; message: string }>;

  update(dto: any, subject: T): Promise<{ data: any; message: string }>;
}
