import type { InferPageProps } from '@adonisjs/inertia/types';
import ContentLayout from '~/components/layouts/content_layout';
import type AppsController from '../../app/controllers/apps_controller';

export default function Home(_: InferPageProps<AppsController, 'index'>) {
  return <ContentLayout>blablabla welcome to MyLinks</ContentLayout>;
}
