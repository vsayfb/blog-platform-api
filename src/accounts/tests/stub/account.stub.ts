import { randomUUID } from 'crypto';

export type AccountStub = {
  id?: string;
  email: string;
  username: string;
  password: string;
};

const stub = {
  email: 'foo@gmail.com',
  password: 'foo1234',
  username: 'foo',
};

export const accountStub = (): AccountStub => ({
  ...stub,
});

export const resultAccountStub = (): AccountStub => ({
  id: randomUUID(),
  ...stub,
});
