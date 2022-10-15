export interface ISmsSenderService {
  sendMessage(to: string, data: string): Promise<void>;
}

export const ISmsSenderService = Symbol('ISmsSenderService');
