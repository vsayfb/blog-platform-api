export interface IUrlManageService {
  generateUniqueUrl(text: string): string;
}

export const IUrlManageService = Symbol('IUrlManageService');
