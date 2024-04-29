import type Collection from '#models/collection';
import { Link } from '@inertiajs/react';
import Footer from '~/components/footer/footer';
import DashboardLayout from '~/components/layouts/dashboard_layout';

// type DashboardPageProps = InferPageProps<CollectionsController, 'index'>
type DashboardPageProps = {
  collections: Collection[];
};

export default function DashboardPage({ collections }: DashboardPageProps) {
  console.log(collections);
  return (
    <DashboardLayout>
      <Link href="/collections/create">Add collection</Link>
      {collections.map((collection) => (
        <li key={collection.id}>{collection.name}</li>
      ))}
      <Footer />
    </DashboardLayout>
  );
}
