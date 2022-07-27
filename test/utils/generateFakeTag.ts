import { faker } from '@faker-js/faker';

export function generateFakeTag(): { name: string; posts: string[] } {
  return { name: faker.random.word(), posts: [] };
}
