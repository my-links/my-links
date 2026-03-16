import { useLingui } from '@lingui/react';
import cx from 'clsx';
import { SUPPORTED_LOCALES } from '~/consts/i18n';
import { dynamicActivate, persistLocale } from '~/i18n/index';
import { Locale } from '~/types/i18n';

const LOCALE_LABELS: Record<Locale, string> = {
	en: 'EN',
	fr: 'FR',
} as const;

const LOCALE_FLAG_CLASSES: Record<Locale, string> = {
	en: 'i-twemoji:flag-united-kingdom',
	fr: 'i-twemoji:flag-france',
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
						'px-2.5 py-1.5 rounded-md transition-all duration-200 cursor-pointer flex items-center justify-center',
						i18n.locale === locale
							? 'bg-white dark:bg-gray-600 shadow-sm'
							: 'opacity-60 hover:opacity-100'
					)}
					aria-label={`Switch to ${LOCALE_LABELS[locale]}`}
				>
					<div className={`${LOCALE_FLAG_CLASSES[locale]} w-5 h-5`} />
				</button>
			))}
		</div>
	);
}
