import { SUPPORTED_LOCALES } from '#shared/consts/i18n';
import { Locale } from '#shared/types/i18n';
import { useLingui } from '@lingui/react';
import cx from 'clsx';
import { dynamicActivate, persistLocale } from '~/i18n/index';

const LOCALE_LABELS: Record<Locale, string> = {
	en: 'EN',
	fr: 'FR',
} as const;

export function LocaleSwitcher() {
	const { i18n } = useLingui();

	const handleLocaleChange = async (locale: Locale) => {
		await dynamicActivate(locale);
		persistLocale(locale);
	};

	return (
		<div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
			{SUPPORTED_LOCALES.map((locale) => (
				<button
					key={locale}
					onClick={() => handleLocaleChange(locale)}
					className={cx(
						'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer',
						i18n.locale === locale
							? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
							: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
					)}
					aria-label={`Switch to ${LOCALE_LABELS[locale]}`}
				>
					{LOCALE_LABELS[locale]}
				</button>
			))}
		</div>
	);
}
