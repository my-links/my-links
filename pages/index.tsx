import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Provider } from 'react-redux';
import Head from 'next/head';

import Menu from '../components/Categories/SideMenu';

import { Category, Link } from '../types';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import { store } from '../redux';
import { BuildCategory } from '../utils/front';

import Links from '../components/Links/Links';

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
				<Menu
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

	if (categories.length === 0) {
		return {
			redirect: {
				destination: '/category/create'
			}
		}
	}

	return {
		props: {
			categories: JSON.parse(JSON.stringify(categories)),
			favorites: JSON.parse(JSON.stringify(favorites)),
		}
	}
}