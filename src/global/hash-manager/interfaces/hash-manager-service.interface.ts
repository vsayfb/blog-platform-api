export interface IHashManagerService {
  hash(text: string, salt?: number): Promise<string> | string;
  compare(
    text: string,
    hashedText: string,
    salt?: number,
  ): Promise<boolean> | boolean;
}

export const IHashManagerService = Symbol('IHashManagerService');
