export interface IDeleteController {
  delete(subject: any): Promise<{ id: string; message: string }>;
}
