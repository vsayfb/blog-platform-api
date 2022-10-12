export interface IUpdateController {
  update(dto: any, subject: any): Promise<{ data: any; message: string }>;
}
