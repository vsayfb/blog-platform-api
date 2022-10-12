export interface IFindService {
  getOneByID(id: string): Promise<any>;
  getAll(): Promise<any[]>;
}
