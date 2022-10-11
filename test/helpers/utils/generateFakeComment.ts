import { faker } from '@faker-js/faker';

export function generateFakeComment() {
  return {
    content: faker.random.words(6),
  };
}
