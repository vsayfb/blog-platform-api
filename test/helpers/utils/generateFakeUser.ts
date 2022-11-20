import { faker } from '@faker-js/faker';

export type FakeUser = {
  email: string;
  password: string;
  username: string;
  display_name: string;
  image: string;
};

export function generateFakeUser(): FakeUser {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(7),
    username: faker.name.firstName() + faker.name.firstName(),
    display_name: faker.internet.userName(),
    image: faker.internet.avatar(),
  };
}
