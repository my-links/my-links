import { SimpleGrid } from '@mantine/core';
import { Feature } from '~/mantine/components/home/feature';

export const featureList = [
	'collection',
	'link',
	'search',
	'extension',
	'share',
	'contribute',
] as const;

export const FeatureList = () => (
	<SimpleGrid
		mt={60}
		cols={{ base: 1, sm: 2, md: 3 }}
		spacing={{ base: 'xl', md: 50 }}
		verticalSpacing={{ base: 'xl', md: 50 }}
	>
		{featureList.map((feature, index) => (
			<Feature name={feature} key={index} />
		))}
	</SimpleGrid>
);
