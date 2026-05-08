import { ApiTokenService } from '#services/user/api_token_service';
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

const TOKEN_NAME = 'MyLinks Browser Extension';

@inject()
export default class ExtensionConnectController {
	constructor(protected readonly apiTokenService: ApiTokenService) {}

	async prepare({ auth, response, inertia, request }: HttpContext) {
		const loggedIn = await auth.use('web').check();
		if (!loggedIn) {
			const q = encodeURIComponent('/extension/connect');
			return response.redirect(`/auth/google?return_to=${q}`);
		}
		return inertia.render('extension/connect', {
			csrfToken: request.csrfToken ?? '',
		});
	}

	async execute({ auth, response }: HttpContext) {
		await auth.authenticateUsing(['web']);
		const user = auth.user!;
		const accessToken = await this.apiTokenService.createToken(user, {
			name: TOKEN_NAME,
		});
		const plain = accessToken.value?.release();
		if (!plain) {
			return response.internalServerError('Could not issue token');
		}
		const inner = JSON.stringify({
			apiToken: plain,
			userId: String(user.id),
		})
			.replace(/</g, '\\u003c')
			.replace(/>/g, '\\u003e');
		const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>MyLinks</title></head><body>
<p id="m">Connecting…</p>
<script type="application/json" id="d">${inner}</script>
<script>
(function () {
  var p = JSON.parse(document.getElementById('d').textContent);
  p.instanceOrigin = location.origin;
  if (window.opener) {
    window.opener.postMessage({ type: 'MYLINKS_EXTENSION_AUTH', payload: p }, '*');
    document.getElementById('m').textContent = 'Done. You can close this tab.';
    setTimeout(function () { window.close(); }, 400);
  } else {
    document.getElementById('m').textContent = 'Open this page from the extension options using Connect with MyLinks.';
  }
})();
</script></body></html>`;
		return response.type('text/html').send(html);
	}
}
