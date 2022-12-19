export interface ISmsSenderService {
  send(to: string, data: string): Promise<any>;
}

export const ISmsSenderService = Symbol('ISmsSenderService');
