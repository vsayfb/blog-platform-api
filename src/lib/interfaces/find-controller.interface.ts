export interface IFindController {
  findOne(where: any, ...args: any[]): Promise<{ data: any; message: string }>;
}
