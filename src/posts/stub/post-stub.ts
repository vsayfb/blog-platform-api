import { SelectedPostFields } from '../types/selected-post-fields';

export const postStub = (): SelectedPostFields => ({
  id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
  title: 'foo title example post',
  title_image: null,
  content: '<h1>Hello World...</h1>',
  url: 'foo-title-example-url',
  published: true,
  created_at: '2022-07-18T12:55:25.513Z' as unknown as Date,
  updated_at: '2022-07-18T12:55:25.513Z' as unknown as Date,
});
