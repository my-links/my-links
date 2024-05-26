import UsersController from '#controllers/users_controller';
import User from '#models/user';
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';
import db from '@adonisjs/lucid/services/db';

class UserWithRelationCountDto {
  constructor(private user: User) {}

  public toJson() {
    return {
      id: this.user.id,
      email: this.user.email,
      fullname: this.user.name,
      avatarUrl: this.user.avatarUrl,
      isAdmin: this.user.isAdmin,
      createdAt: this.user.createdAt,
      updatedAt: this.user.updatedAt,
      count: {
        link: Number(this.user.$extras.totalLinks),
        collection: Number(this.user.$extras.totalCollections),
      },
    };
  }
}

@inject()
export default class AdminController {
  constructor(protected usersController: UsersController) {}

  async index({ inertia }: HttpContext) {
    const users = await this.usersController.getAllUsersWithTotalRelations();
    const links = await db.from('links').count('* as total');
    const collections = await db.from('collections').count('* as total');

    return inertia.render('admin/dashboard', {
      users: users.map((user) => new UserWithRelationCountDto(user).toJson()),
      totalLinks: Number(links[0].total),
      totalCollections: Number(collections[0].total),
    });
  }
}
