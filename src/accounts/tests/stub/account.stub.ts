import { randomUUID } from 'crypto';

export type AccountStub = {
  id?: string;
  email: string;
  username: string;
  password: string;
  display_name: string;
  image: null | string;
};

const stub = {
  email: 'foo@gmail.com',
  password: 'foo1234',
  display_name: 'foo_display_name',
  username: 'foo',
  image: null,
};

export const accountStub = (): AccountStub => ({
  ...stub,
});

export const resultAccountStub = (): AccountStub => {
  delete stub.password;
  return {
    id: randomUUID(),
    ...stub,
  };
};
