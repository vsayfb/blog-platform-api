import { faker } from '@faker-js/faker';

export function generateFakeMessage() {
  return {
    content: faker.random.words(6),
  };
}
