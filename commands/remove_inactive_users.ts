import UsersController from '#controllers/users_controller';
import { inject } from '@adonisjs/core';
import { BaseCommand } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';

export default class RemoveInactiveUsers extends BaseCommand {
  static commandName = 'remove:inactive-users';
  static description = '';

  static options: CommandOptions = {};

  @inject()
  async run(usersController: UsersController) {
    const inactiveUsers = await usersController.getAllInactiveUsers();
    await Promise.all(inactiveUsers.map((user) => user.delete()));
    console.log(`Removed ${inactiveUsers.length} inactive users`);
  }
}
