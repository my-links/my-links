import { getDisplayPreferences } from '#shared/lib/display_preferences';
import { updateDisplayPreferencesValidator } from '#validators/user/update_display_preferences';
import { HttpContext } from '@adonisjs/core/http';

export default class DisplayPreferencesController {
	async update({ request, response, auth }: HttpContext) {
		const { displayPreferences } = await request.validateUsing(
			updateDisplayPreferencesValidator
		);
		const userPrefs = auth.user!.displayPreferences ?? {};
		const mergedPrefs = {
			linkListDisplay:
				displayPreferences.linkListDisplay ??
				userPrefs.linkListDisplay ??
				getDisplayPreferences().linkListDisplay,
			collectionListDisplay:
				displayPreferences.collectionListDisplay ??
				userPrefs.collectionListDisplay ??
				getDisplayPreferences().collectionListDisplay,
		};
		auth.user!.displayPreferences = mergedPrefs;
		await auth.user!.save();
		return response.redirect().withQs().back();
	}
}
