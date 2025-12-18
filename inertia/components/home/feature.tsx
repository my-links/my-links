import { Text, ThemeIcon, rem } from '@mantine/core';
import { Trans } from '@lingui/react/macro';
import { featureList } from '~/components/home/feature_list';

type FeatureName = (typeof featureList)[number];

function getIconClass(name: FeatureName): string {
	switch (name) {
		case 'collection':
			return 'i-ant-design-folder-open-filled';
		case 'link':
			return 'i-ion-link';
		case 'search':
			return 'i-ion-search';
		case 'extension':
			return 'i-ion-extension-puzzle-outline';
		case 'share':
			return 'i-ion-share-alt';
		case 'contribute':
			return 'i-fa6-solid-user';
	}
}

function getFeatureTitle(name: FeatureName) {
	switch (name) {
		case 'collection':
			return <Trans id="about:collection.title">Collections</Trans>;
		case 'link':
			return <Trans id="about:link.title">Links</Trans>;
		case 'search':
			return <Trans id="about:search.title">Search</Trans>;
		case 'extension':
			return <Trans id="about:extension.title">Extension</Trans>;
		case 'share':
			return <Trans id="about:share.title">Share</Trans>;
		case 'contribute':
			return <Trans id="about:contribute.title">Contribute</Trans>;
	}
}

function getFeatureText(name: FeatureName) {
	switch (name) {
		case 'collection':
			return (
				<Trans id="about:collection.text">
					Organize your links into collections
				</Trans>
			);
		case 'link':
			return (
				<Trans id="about:link.text">Save and manage your favorite links</Trans>
			);
		case 'search':
			return (
				<Trans id="about:search.text">
					Quickly find what you're looking for
				</Trans>
			);
		case 'extension':
			return (
				<Trans id="about:extension.text">
					Use our browser extension for quick access
				</Trans>
			);
		case 'share':
			return (
				<Trans id="about:share.text">Share your collections with others</Trans>
			);
		case 'contribute':
			return (
				<Trans id="about:contribute.text">
					Help improve the project by contributing
				</Trans>
			);
	}
}

interface FeatureProps {
	name: FeatureName;
}

export function Feature({ name: featureName }: FeatureProps) {
	const iconClass = getIconClass(featureName);
	return (
		<div>
			<ThemeIcon variant="light" size={40} radius={40}>
				<div
					className={iconClass}
					style={{ width: rem(18), height: rem(18) }}
				/>
			</ThemeIcon>
			<Text mt="sm" mb={7}>
				{getFeatureTitle(featureName)}
			</Text>
			<Text size="sm" c="dimmed" lh={1.6}>
				{getFeatureText(featureName)}
			</Text>
		</div>
	);
}
