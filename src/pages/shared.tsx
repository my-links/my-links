import Footer from 'components/Footer/Footer';
import CategoryDescription from 'components/Links/CategoryDescription/CategoryDescription';
import CategoryHeader from 'components/Links/CategoryHeader/CategoryHeader';
import LinkList from 'components/Links/LinkList/LinkList';
import Navbar from 'components/Navbar/Navbar';
import PageTransition from 'components/PageTransition';
import PATHS from 'constants/paths';
import { getServerSideTranslation } from 'i18n';
import getPublicCategoryById from 'lib/category/getPublicCategoryById';
import { useTranslation } from 'next-i18next';
import { DefaultSeo } from 'next-seo';
import styles from 'styles/shared.module.scss';
import { CategoryWithLinks } from 'types/types';
import { getSession } from 'utils/session';

export default function SharedCategoryPage({
  category,
}: {
  category: CategoryWithLinks;
}) {
  const { t } = useTranslation();
  return (
    <PageTransition className='App'>
      <DefaultSeo
        title={category.name}
        description={category.description ?? undefined}
      />
      <Navbar />
      <main className={styles['content']}>
        <div className={styles['header']}>
          <h2 className={styles['title']}>
            <CategoryHeader activeCategory={category} />
          </h2>
          <CategoryDescription description={category.description} />
        </div>
        {category.links.length !== 0 ? (
          <LinkList
            links={category.links}
            showUserControls={false}
          />
        ) : (
          <div className={styles['no-link-wrapper']}>
            <p
              dangerouslySetInnerHTML={{
                __html: t('home:no-link', { name: category.name } as any, {
                  interpolation: { escapeValue: false },
                }),
              }}
            />
          </div>
        )}
      </main>
      <Footer />
    </PageTransition>
  );
}

export async function getServerSideProps({ req, res, locale, query }) {
  const session = await getSession(req, res);
  const queryCategoryId = (query?.id as string) || '';

  const publicCategory = await getPublicCategoryById(Number(queryCategoryId));
  if (!publicCategory) {
    return {
      redirect: {
        destination: PATHS.APP,
      },
    };
  }

  return {
    props: {
      session,
      category: publicCategory
        ? JSON.parse(JSON.stringify(publicCategory))
        : null,
      ...(await getServerSideTranslation(locale, ['home'])),
    },
  };
}
