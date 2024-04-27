import User from '#models/user';
import { GoogleToken } from '@adonisjs/ally/types';
import { BaseSeeder } from '@adonisjs/lucid/seeders';
import { faker } from '@faker-js/faker';

export default class extends BaseSeeder {
  static environment = ['development', 'testing'];

  async run() {
    const users = faker.helpers.multiple(createRandomUser, {
      count: 25,
    });
    await User.createMany(users);
  }
}

export function createRandomUser() {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.internet.userName(),
    nickName: faker.internet.displayName(),
    avatarUrl: faker.image.avatar(),
    isAdmin: false,
    providerId: faker.string.uuid(),
    token: {} as GoogleToken,
  };
}
