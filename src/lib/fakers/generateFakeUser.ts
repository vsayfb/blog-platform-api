import { faker } from '@faker-js/faker';

export function generateFakeUser() {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(7),
    username: faker.name.firstName() + faker.name.firstName(),
    display_name: faker.internet.userName(),
  };
}
