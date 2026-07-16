export default class RouteProvider {
	async boot() {
		await import('../src/extensions.js');
	}
}
