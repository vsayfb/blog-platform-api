import { faker } from '@faker-js/faker';

export type FakeUser = {
  email: string;
  mobile_phone: string;
  password: string;
  username: string;
  display_name: string;
  image: string;
};

export function generateFakeAccount(): FakeUser {
  return {
    email: faker.internet.email(),
    mobile_phone: faker.phone.number(),
    password: faker.internet.password(7),
    username: faker.name.firstName() + faker.name.firstName(),
    display_name: faker.internet.userName(),
    image: faker.internet.avatar(),
  };
}
