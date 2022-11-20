export interface IUpdateController {
  update(
    dto: any,
    subject: any,
    ...args
  ): Promise<{ data: any; message: string }>;
}
