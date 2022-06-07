import { randomUUID } from 'crypto';
import { accountStub } from '../accounts/tests/stub/account.stub';
import { Repository } from 'typeorm';

export default function autoMock<T>(repository: Repository<T>): void {
  const data = { id: randomUUID(), ...accountStub() } as any;

  jest.spyOn(repository, 'save').mockResolvedValueOnce(data);
  jest.spyOn(repository, 'findOne').mockResolvedValueOnce(data);
  jest.spyOn(repository, 'findOne').mockResolvedValueOnce(data);
  jest.spyOn(repository, 'getId').mockResolvedValueOnce(data.id);
}
