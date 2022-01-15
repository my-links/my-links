import { createRef, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';

import Categories from '../components/Categories/Categories';
import Links from '../components/Links/Links';

import styles from '../styles/Home.module.scss';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default function Home({ categories, favorites }) {
	const { data: session, status } = useSession();
	const [categoryActive, setCategoryActive] = useState(categories?.[0]?.id);
	const refCategoryActive = useRef();

	const handleSelectCategory = (id) => {
		if (!refCategoryActive?.current) return;
		
		const { ref } = categories.find(c => c.id === id);
		ref?.current?.scrollIntoView({
			block: 'end',
			behavior: 'smooth'
		});
	}
	console.log(session, session?.user);

	return (
		<div className={styles.App}>
			<Categories
				categories={categories}
				favorites={favorites}
				handleSelectCategory={handleSelectCategory}
				categoryActive={categoryActive}
				session={session}
			/>
			<Links
				categories={categories}
				setCategoryActive={setCategoryActive}
				refCategoryActive={refCategoryActive}
				session={session}
			/>
		</div>
	)
}

export async function getStaticProps(context) {
	const categories = await prisma.category.findMany({
		include: {
			links: true
		}
	});

	const favorites = [];
	categories.map((category) => {
		category['ref'] = createRef();
		category['links'] = category.links.map((link) => {
			if (link.favorite)
				favorites.push(link);

			link['categoryName'] = category.name;
			return link;
		});

		return category;
	});

	return {
		props: {
			categories: JSON.parse(JSON.stringify(categories)),
			favorites: JSON.parse(JSON.stringify(favorites))
		}
	}
}