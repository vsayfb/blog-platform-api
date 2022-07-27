import { tagStub } from 'src/tags/stub/tag.stub';
import { accountStub } from 'src/accounts/test/stub/account.stub';
import { randomUUID } from 'crypto';
import { jwtPayloadStub } from 'src/auth/stub/jwt-payload.stub';
import { CaslAbilityFactory, Action } from 'src/casl/casl-ability.factory';
import { Post } from 'src/posts/entities/post.entity';
import { Account, Role } from 'src/accounts/entities/account.entity';
import { Tag } from 'src/tags/entities/tag.entity';

describe('CaslAbilityFactory', () => {
  const caslAbilityFactory = new CaslAbilityFactory();

  describe('when CaslAbilityFactory called', () => {
    const userJesse = jwtPayloadStub();

    const tag = new Tag();
    tag.name = tagStub().name;

    const jessePost = new Post();
    const walterPost = new Post();
    jessePost.author = { ...accountStub(), id: userJesse.sub } as Account;
    walterPost.author = { ...accountStub(), id: randomUUID() } as Account;

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
      const moderator = { ...jwtPayloadStub(), role: Role.MODERATOR };

      const ability = caslAbilityFactory.createForUser({ user: moderator });

      test('a moderator can manage tags', () => {
        expect(ability.can(Action.Manage, tag)).toBe(true);
      });

      test('a moderator can posts', () => {
        expect(ability.can(Action.Manage, jessePost)).toBe(true);
        expect(ability.can(Action.Manage, walterPost)).toBe(true);
      });
    });

    describe('if user is an admin', () => {
      const admin = { ...jwtPayloadStub(), role: Role.ADMIN };

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
