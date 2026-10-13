import { afterEach, describe, expect, it, vi } from 'vitest';

import { recordLinkVisit } from '@/lib/api/links';
import { isMiddleClick, reportLinkVisit } from '@/lib/api/report_link_visit';

vi.mock('@/lib/api/links', () => ({ recordLinkVisit: vi.fn() }));

describe('reportLinkVisit', () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.mocked(recordLinkVisit).mockReset();
	});

	it('should record the visit for the given link', () => {
		vi.mocked(recordLinkVisit).mockResolvedValue();

		reportLinkVisit(42);

		expect(recordLinkVisit).toHaveBeenCalledWith(42);
	});

	it('should log instead of throwing when recording fails', async () => {
		const consoleError = vi
			.spyOn(console, 'error')
			.mockImplementation(() => undefined);
		vi.mocked(recordLinkVisit).mockRejectedValue(new Error('offline'));

		reportLinkVisit(42);
		await vi.waitFor(() => expect(consoleError).toHaveBeenCalledOnce());
	});
});

describe('isMiddleClick', () => {
	it('should be true for the middle mouse button', () => {
		expect(isMiddleClick({ button: 1 })).toBe(true);
	});

	it('should be false for the right mouse button', () => {
		expect(isMiddleClick({ button: 2 })).toBe(false);
	});
});
