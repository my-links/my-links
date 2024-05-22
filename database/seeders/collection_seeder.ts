import Collection from '#models/collection';
import User from '#models/user';
import { BaseSeeder } from '@adonisjs/lucid/seeders';
import { faker } from '@faker-js/faker';
import { Visibility } from '../../app/enums/visibility.js';

export default class extends BaseSeeder {
  static environment = ['development', 'testing'];

  async run() {
    // eslint-disable-next-line unicorn/no-await-expression-member
    const users = await getUserIds();

    const collections = faker.helpers.multiple(
      () => createRandomCollection(users),
      {
        count: 50,
      }
    );
    await Collection.createMany(collections);
  }
}

export async function getUserIds() {
  const users = await User.all();
  return users.map(({ id }) => id);
}

function createRandomCollection(userIds: User['id'][]) {
  const authorId = faker.helpers.arrayElements(userIds, 1).at(0);
  return {
    id: faker.string.uuid(),
    name: faker.string.alphanumeric({ length: { min: 5, max: 25 } }),
    description: faker.string.alphanumeric({ length: { min: 0, max: 254 } }),
    visibility: Visibility.PRIVATE,
    nextId: undefined,
    authorId,
  };
}
