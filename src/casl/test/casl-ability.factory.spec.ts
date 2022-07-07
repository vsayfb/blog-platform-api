import { tagStub } from 'src/tags/stub/tag.stub';
import { accountStub } from 'src/accounts/test/stub/account.stub';
import { randomUUID } from 'crypto';
import { postStub } from 'src/posts/stub/post-stub';
import { jwtPayloadStub } from 'src/auth/stub/jwt-payload.stub';
import { CaslAbilityFactory, Action } from 'src/casl/casl-ability.factory';
import { Post } from 'src/posts/entities/post.entity';
import { Role } from 'src/accounts/entities/account.entity';
import { Tag } from 'src/tags/entities/tag.entity';
describe('CaslAbilityFactory', () => {
  const caslAbilityFactory = new CaslAbilityFactory();

  describe('when CaslAbilityFactoryCalled', () => {
    const userJesse = { ...jwtPayloadStub, sub: postStub().author.id };

    const tag = new Tag();
    tag.name = tagStub().name;

    const jessePost = new Post();
    const walterPost = new Post();
    jessePost.author = { ...accountStub(), id: userJesse.sub };
    walterPost.author = { ...accountStub(), id: randomUUID() };

    const ability = caslAbilityFactory.createForUser({ user: userJesse });

    describe('if user just a user', () => {
      test('user jesse can manage own post', () => {
        expect(ability.can(Action.Manage, jessePost)).toBe(true);
      });

      test("user jesse can not manage walter's post", () => {
        expect(ability.can(Action.Manage, walterPost)).toBe(false);
      });
    });

    describe('if user is a moderator', () => {
      const moderator = { ...jwtPayloadStub, role: Role.MODERATOR };

      const ability = caslAbilityFactory.createForUser({ user: moderator });

      test('a moderator can manage tags', () => {
        expect(ability.can(Action.Manage, tag)).toBe(true);
      });

      test('a moderator can not manage posts', () => {
        expect(ability.can(Action.Manage, jessePost)).toBe(false);
        expect(ability.can(Action.Manage, walterPost)).toBe(false);
      });
    });

    describe('if user is an admin', () => {
      const admin = { ...jwtPayloadStub, role: Role.ADMIN };

      const ability = caslAbilityFactory.createForUser({ user: admin });

      test('an admin can manage tags', () => {
        expect(ability.can(Action.Manage, tag)).toBe(true);
      });

      test('an admin can manage posts', () => {
        expect(ability.can(Action.Manage, jessePost)).toBe(true);
        expect(ability.can(Action.Manage, walterPost)).toBe(true);
      });
    });
  });
});
