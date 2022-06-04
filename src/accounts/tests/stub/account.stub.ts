import { randomUUID } from 'crypto';
type AccountStub = {
  id?: string;
  email: string;
  username: string;
  password: string;
};

const stub = {
  email: 'foo@gmail.com',
  password: 'foo123',
  username: 'foo',
};

export const accountStub = () => ({
  ...stub,
});

export const resultAccountStub = () => ({
  id: randomUUID(),
  ...stub,
});
