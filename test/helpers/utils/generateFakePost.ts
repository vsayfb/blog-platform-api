import { faker } from '@faker-js/faker';

export function generateFakePost() {
  return {
    title: faker.random.words(6),
    content: faker.random.words(10),
    tags: [faker.random.word(), faker.random.word(), faker.random.word()],
  };
}
