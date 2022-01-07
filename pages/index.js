import styles from '../styles/Home.module.scss';

import Categories from '../components/Categories/Categories';
import Links from '../components/Links/Links';
import { createRef, useRef, useState } from 'react';

export default function Home({ categories, favorites }) {
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

	return (
		<div className={styles.App}>
			<Categories
				categories={categories}
				favorites={favorites}
				handleSelectCategory={handleSelectCategory}
				categoryActive={categoryActive}
			/>
			<Links
				categories={categories}
				setCategoryActive={setCategoryActive}
				refCategoryActive={refCategoryActive}
			/>
		</div>
	)
}

export async function getStaticProps(context) {
	const categories = [];
	for (let i = 0; i < 20; i++) {
		const links = [];
		for (let y = 0; y < randomIntFromInterval(5, 25); y++) {
			links.push({
				id: y,
				name: 'Lien #' + (y + 1),
				category: i,
				link: `https://google.com/search?q=${y}`
			});
		}

		categories.push({
			id: i,
			name: 'Catégorie #' + (i + 1),
			links,
			ref: createRef()
		});
	}

	const favorites = [];
	for (let i = 0; i < 5; i++) {
		const category = categories[Math.floor(Math.random() * categories.length)];
		const link = category.links[Math.floor(Math.random() * category.links.length)]
		favorites.push(link);
	}

	console.log(favorites);
	return {
		props: {
			categories,
			favorites
		}
	}
}

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}