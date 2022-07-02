import { Tag } from 'src/tags/entities/tag.entity';

export const tagStub = (): Tag => ({
  id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
  name: 'node-js',
  posts: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});
