import type { HttpContext } from '@adonisjs/core/http';

export default class AppsController {
  index({ inertia }: HttpContext) {
    return inertia.render('home');
  }
}
