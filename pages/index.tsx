import { createRef, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Provider } from 'react-redux';
import Head from 'next/head'

import Categories from '../components/Categories/Categories';
import Links from '../components/Links/Links';

import { Category, Link } from '../types';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import { store } from '../redux';

interface HomeProps {
	categories: Category[];
	favorites: Link[];
}

export default function Home({ categories, favorites }: HomeProps) {
	const { data: session, status } = useSession({ required: true });
	const [categoryActive, setCategoryActive] = useState<Category | null>(categories?.[0]);

	const handleSelectCategory = (category: Category) => setCategoryActive(category);

	if (status === 'loading') {
		return (<p>Chargement de la session en cours</p>)
	}

	return (
		<Provider store={store}>
			<Head>
				<title>Superpipo</title>
			</Head>
			<div className='App'>
				<Categories
					categories={categories}
					favorites={favorites}
					handleSelectCategory={handleSelectCategory}
					categoryActive={categoryActive}
					session={session}
				/>
				<Links category={categoryActive} />
			</div>
		</Provider>
	)
}

export async function getStaticProps() {
	const categoriesDB = await prisma.category.findMany({ include: { links: true } });

	const favorites = [] as Link[];
	const categories = categoriesDB.map((categoryDB) => {
		const category = BuildCategory(categoryDB);
		category.links.map((link) => link.favorite ? favorites.push(link) : null);
		return category;
	});

	return {
		props: {
			categories: JSON.parse(JSON.stringify(categories)),
			favorites: JSON.parse(JSON.stringify(favorites)),
		}
	}
}

export function BuildCategory({ id, name, order, links = [], createdAt, updatedAt }): Category {
	return {
		id,
		name,
		links: links.map((link) => BuildLink(link, { categoryId: id, categoryName: name })),
		order,
		createdAt,
		updatedAt
	}
}

export function BuildLink({ id, name, url, order, favorite, createdAt, updatedAt }, { categoryId, categoryName }): Link {
	return {
		id,
		name,
		url,
		category: {
			id: categoryId,
			name: categoryName
		},
		order,
		favorite,
		createdAt,
		updatedAt
	}
}