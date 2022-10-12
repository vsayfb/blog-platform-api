export interface ICreateController {
  create(dto: any, ...args: any[]): Promise<{ data: any; message: string }>;
}
